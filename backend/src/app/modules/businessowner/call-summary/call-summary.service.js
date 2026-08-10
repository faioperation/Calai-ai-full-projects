import prisma from "../../../prisma/client.js";
import { VapiLib } from "../../../lib/vapi.js";
import { format } from "date-fns";

/**
 * Helper to parse a raw transcript string into a structured AI/User conversation array
 * Supports speaker formats like "AI:", "User:", "Assistant:", "Customer:", "Bot:"
 * @param {string} rawTranscript
 * @returns {Array<{role: string, content: string}>}
 */
const parseTranscript = (rawTranscript) => {
  if (!rawTranscript || rawTranscript === "No transcript available") {
    return [];
  }

  // If already parsed or is an array, return it
  if (Array.isArray(rawTranscript)) {
    return rawTranscript;
  }

  try {
    const parsed = JSON.parse(rawTranscript);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        role: item.role || item.speaker || "Unknown",
        content: item.content || item.message || item.text || "",
      }));
    }
  } catch (e) {
    // Treat as raw text
  }

  const rawLines = rawTranscript.split("\n");
  return rawLines
    .map((line) => {
      // Matches roles: AI, User, Assistant, Customer, Bot
      const match = line.match(/^(AI|User|Assistant|Customer|Bot):\s*(.*)$/i);
      if (match) {
        let role = match[1].trim().toUpperCase();
        if (role === "ASSISTANT" || role === "BOT") {
          role = "AI";
        } else if (role === "CUSTOMER") {
          role = "User";
        }
        // Format to standard capitalization
        role =
          role === "AI"
            ? "AI"
            : role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

        return {
          role,
          content: match[2].trim(),
        };
      }
      return null;
    })
    .filter((item) => item !== null);
};

/**
 * Get call summaries for a business owner
 * @param {string} userId - The ID of the business owner
 * @param {Object} filters - Optional query filters
 * @returns {Promise<Array>} - Formatted call summaries
 */
const getCallSummaries = async (userId, filters = {}) => {
  // 1. Find the business for this user
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  // 2. Fetch calls from Database (populated by webhook)
  const whereClause = { businessId: business.id };

  if (filters.vapiAgentId) {
    whereClause.vapiAgentId = filters.vapiAgentId;
  } else if (filters.agentId) {
    const agent = await prisma.agent.findFirst({
      where: { id: filters.agentId, businessId: business.id },
    });
    if (agent) {
      whereClause.vapiAgentId = agent.vapiAgentId;
    }
  }

  const calls = await prisma.call.findMany({
    where: whereClause,
    include: {
      callSummary: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });

  // 3. Format for UI and apply dynamic self-healing
  const formattedSummaries = await Promise.all(
    calls.map(async (call) => {
      let duration = call.duration;
      let summary = call.callSummary?.summary || "No summary available";
      let transcript =
        call.callSummary?.transcript || "No transcript available";

      // If transcript is missing OR duration is 0, try self-healing from Vapi using the vapiCallId
      if (
        (transcript === "No transcript available" ||
          summary === "No summary available" ||
          duration === 0) &&
        call.vapiCallId &&
        !call.vapiCallId.startsWith("direct-")
      ) {
        try {
          const vapiCallData = await VapiLib.fetchCallById(call.vapiCallId);
          if (vapiCallData) {
            // Self-heal summary and transcript
            const fetchedSummary =
              vapiCallData.analysis?.summary ||
              vapiCallData.summary ||
              "No summary available";
            const fetchedTranscript =
              vapiCallData.analysis?.transcript ||
              vapiCallData.transcript ||
              "No transcript available";

            if (
              fetchedSummary !== "No summary available" ||
              fetchedTranscript !== "No transcript available"
            ) {
              summary = fetchedSummary;
              transcript = fetchedTranscript;

              await prisma.callSummary.upsert({
                where: { callId: call.id },
                update: {
                  summary: fetchedSummary,
                  transcript: fetchedTranscript,
                },
                create: {
                  callId: call.id,
                  summary: fetchedSummary,
                  transcript: fetchedTranscript,
                },
              });
            }

            // Self-heal duration
            let durationInSeconds = 0;
            if (vapiCallData.duration !== undefined)
              durationInSeconds = Number(vapiCallData.duration);
            else if (vapiCallData.durationSeconds !== undefined)
              durationInSeconds = Number(vapiCallData.durationSeconds);
            else if (vapiCallData.endedAt && vapiCallData.startedAt) {
              const start = new Date(vapiCallData.startedAt);
              const end = new Date(vapiCallData.endedAt);
              durationInSeconds = Math.max(
                0,
                (end.getTime() - start.getTime()) / 1000,
              );
            }

            if (durationInSeconds > 0) {
              duration = Math.floor(durationInSeconds);

              // Persist duration to DB
              await prisma.call.update({
                where: { id: call.id },
                data: { duration: duration },
              });
            }
          }
        } catch (err) {
          console.error(`Failed to self-heal call ${call.id}:`, err.message);
        }
      }

      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const durationFormatted = `${minutes}:${seconds.toString().padStart(2, "0")} minutes`;

      return {
        id: call.id,
        callerId: call.customerNumber || "Unknown",
        duration: durationFormatted,
        time: format(call.startTime, "h:mm a"),
        date: format(call.startTime, "dd/MM/yyyy"),
        summary: summary,
        transcript: parseTranscript(transcript),
      };
    }),
  );

  return formattedSummaries;
};

/**
 * Get summary by call ID
 * @param {string} callId - The ID of the call
 * @returns {Promise<Object>} - The call summary
 */
const getCallSummaryById = async (userId, callId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  const call = await prisma.call.findFirst({
    where: { id: callId, businessId: business.id },
  });

  if (!call) {
    throw new Error("Call not found or access denied");
  }

  let callSummary = await prisma.callSummary.findUnique({
    where: { callId: callId },
  });

  if (
    !callSummary ||
    !callSummary.summary ||
    callSummary.summary === "No summary available"
  ) {
    if (call.vapiCallId && !call.vapiCallId.startsWith("direct-")) {
      try {
        const vapiCallData = await VapiLib.fetchCallById(call.vapiCallId);
        if (vapiCallData) {
          const fetchedSummary =
            vapiCallData.analysis?.summary ||
            vapiCallData.summary ||
            "No summary available";
          const fetchedTranscript =
            vapiCallData.analysis?.transcript ||
            vapiCallData.transcript ||
            "No transcript available";

          callSummary = await prisma.callSummary.upsert({
            where: { callId: callId },
            update: {
              summary: fetchedSummary,
              transcript: fetchedTranscript,
            },
            create: {
              callId: callId,
              summary: fetchedSummary,
              transcript: fetchedTranscript,
            },
          });
        }
      } catch (err) {
        console.error(`Failed to self-heal call summary by ID:`, err.message);
      }
    }
  }

  if (!callSummary) {
    throw new Error("Call summary not found");
  }

  return {
    summary: callSummary.summary,
  };
};

/**
 * Get transcript by call ID
 * @param {string} callId - The ID of the call
 * @returns {Promise<Object>} - The call transcript
 */
const getCallTranscriptById = async (userId, callId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  const call = await prisma.call.findFirst({
    where: { id: callId, businessId: business.id },
  });

  if (!call) {
    throw new Error("Call not found or access denied");
  }

  let callSummary = await prisma.callSummary.findUnique({
    where: { callId: callId },
  });

  if (
    !callSummary ||
    !callSummary.transcript ||
    callSummary.transcript === "No transcript available"
  ) {
    if (call.vapiCallId && !call.vapiCallId.startsWith("direct-")) {
      try {
        const vapiCallData = await VapiLib.fetchCallById(call.vapiCallId);
        if (vapiCallData) {
          const fetchedSummary =
            vapiCallData.analysis?.summary ||
            vapiCallData.summary ||
            "No summary available";
          const fetchedTranscript =
            vapiCallData.analysis?.transcript ||
            vapiCallData.transcript ||
            "No transcript available";

          callSummary = await prisma.callSummary.upsert({
            where: { callId: callId },
            update: {
              summary: fetchedSummary,
              transcript: fetchedTranscript,
            },
            create: {
              callId: callId,
              summary: fetchedSummary,
              transcript: fetchedTranscript,
            },
          });
        }
      } catch (err) {
        console.error(
          `Failed to self-heal call transcript by ID:`,
          err.message,
        );
      }
    }
  }

  if (
    !callSummary ||
    !callSummary.transcript ||
    callSummary.transcript === "No transcript available"
  ) {
    throw new Error("Call transcript not found");
  }

  return {
    transcript: parseTranscript(callSummary.transcript),
  };
};

/**
 * Get full call details for PDF generation
 * @param {string} callId - The ID of the call
 * @returns {Promise<Object>} - Full call details
 */
const getCallDetailsForPdf = async (userId, callId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  const call = await prisma.call.findFirst({
    where: { id: callId, businessId: business.id },
    include: {
      callSummary: true,
    },
  });

  if (!call) {
    throw new Error("Call not found or access denied");
  }

  let callSummary = call.callSummary;
  let duration = call.duration;

  if (
    (!callSummary ||
      !callSummary.transcript ||
      callSummary.transcript === "No transcript available" ||
      duration === 0) &&
    call.vapiCallId &&
    !call.vapiCallId.startsWith("direct-")
  ) {
    try {
      const vapiCallData = await VapiLib.fetchCallById(call.vapiCallId);
      if (vapiCallData) {
        const fetchedSummary =
          vapiCallData.analysis?.summary ||
          vapiCallData.summary ||
          "No summary available";
        const fetchedTranscript =
          vapiCallData.analysis?.transcript ||
          vapiCallData.transcript ||
          "No transcript available";

        callSummary = await prisma.callSummary.upsert({
          where: { callId: callId },
          update: {
            summary: fetchedSummary,
            transcript: fetchedTranscript,
          },
          create: {
            callId: callId,
            summary: fetchedSummary,
            transcript: fetchedTranscript,
          },
        });

        // Self-heal duration
        let durationInSeconds = 0;
        if (vapiCallData.duration !== undefined)
          durationInSeconds = Number(vapiCallData.duration);
        else if (vapiCallData.durationSeconds !== undefined)
          durationInSeconds = Number(vapiCallData.durationSeconds);
        else if (vapiCallData.endedAt && vapiCallData.startedAt) {
          const start = new Date(vapiCallData.startedAt);
          const end = new Date(vapiCallData.endedAt);
          durationInSeconds = Math.max(
            0,
            (end.getTime() - start.getTime()) / 1000,
          );
        }

        if (durationInSeconds > 0) {
          duration = Math.floor(durationInSeconds);

          // Persist duration to DB
          await prisma.call.update({
            where: { id: callId },
            data: { duration: duration },
          });
        }
      }
    } catch (err) {
      console.error(`Failed to self-heal call details for PDF:`, err.message);
    }
  }

  const startTime = new Date(call.startTime);
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  const durationFormatted = `${minutes}:${seconds.toString().padStart(2, "0")} minutes`;

  return {
    id: call.id,
    callerId: call.customerNumber,
    duration: durationFormatted,
    time: format(startTime, "h:mm a"),
    date: format(startTime, "dd/MM/yyyy"),
    summary: callSummary?.summary || "No summary available",
    transcript: parseTranscript(callSummary?.transcript),
  };
};

export const CallSummaryService = {
  getCallSummaries,
  getCallSummaryById,
  getCallTranscriptById,
  getCallDetailsForPdf,
};
