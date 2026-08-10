import axios from "axios";
import prisma from "../../../prisma/client.js";
import { envVars } from "../../../config/env.js";

// Fetch all telephony numbers/agents from database that are connected to a number
const getAllTelephonyFromDB = async () => {
  const agents = await prisma.agent.findMany({
    where: {
      NOT: [{ twilioNumber: "TBD" }, { twilioNumber: "" }],
    },
    select: {
      id: true,
      name: true,
      twilioNumber: true,
      managerNumber: true,
      vapiAgentId: true,
      vapiPhoneNumberId: true,
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      twilioNumber: "asc",
    },
  });

  return agents.map((agent) => ({
    id: agent.id,
    agentName: agent.name,
    twilioNumber: agent.twilioNumber,
    managerNumber: agent.managerNumber,
    vapiAgentId: agent.vapiAgentId,
    vapiPhoneNumberId: agent.vapiPhoneNumberId,
    business: agent.business,
  }));
};

// Fetch a single telephony/agent entry by ID
const getTelephonyByIdFromDB = async (id) => {
  const agent = await prisma.agent.findFirst({
    where: {
      OR: [{ id: id }, { vapiPhoneNumberId: id }],
    },
    select: {
      id: true,
      name: true,
      twilioNumber: true,
      managerNumber: true,
      vapiAgentId: true,
      vapiPhoneNumberId: true,
      business: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!agent) return null;

  return {
    id: agent.id,
    agentName: agent.name,
    twilioNumber: agent.twilioNumber,
    managerNumber: agent.managerNumber,
    vapiAgentId: agent.vapiAgentId,
    vapiPhoneNumberId: agent.vapiPhoneNumberId,
    business: agent.business,
  };
};

// Create (or rather, link and update) a telephony/agent configuration in database
const createTelephonyInDB = async (payload) => {
  const { assistant_id, twilio_number, manager_number, businessId } = payload;

  const existingAgent = await prisma.agent.findFirst({
    where: {
      vapiAgentId: assistant_id,
      businessId,
    },
  });

  if (!existingAgent) {
    return null;
  }

  // Check if numbers are already configured (i.e., not the placeholder "TBD")
  const isTwilioConfigured =
    existingAgent.twilioNumber &&
    existingAgent.twilioNumber !== "TBD" &&
    existingAgent.twilioNumber !== "";
  const isManagerConfigured =
    existingAgent.managerNumber &&
    existingAgent.managerNumber !== "TBD" &&
    existingAgent.managerNumber !== "";

  if (isTwilioConfigured && isManagerConfigured) {
    return "ALREADY_EXISTS";
  }

  // Hit the AI service to link the telephony number to the assistant
  const aiEndpoint = `${envVars.AI_SERVICE_URL}/api/telephony/link`;
  let vapiPhoneNumberId = null;
  try {
    console.log(`Forwarding telephony config to AI service: ${aiEndpoint}`);
    const response = await axios.post(aiEndpoint, {
      assistant_id,
      twilio_number,
      manager_number,
    });
    vapiPhoneNumberId = response.data?.vapi_response?.id || null;
    console.log(
      "Successfully linked telephony configuration in AI service. Vapi Phone ID:",
      vapiPhoneNumberId,
    );
  } catch (error) {
    console.error(
      "AI Telephony Service Error:",
      error.response?.data || error.message,
    );
    throw new Error(
      `Failed to link telephony on AI Service: ${error.response?.data?.message || error.message}`,
    );
  }

  return await prisma.agent.update({
    where: { id: existingAgent.id },
    data: {
      twilioNumber: twilio_number,
      managerNumber: manager_number,
      vapiPhoneNumberId,
    },
    select: {
      id: true,
      twilioNumber: true,
      managerNumber: true,
      vapiAgentId: true,
      vapiPhoneNumberId: true,
    },
  });
};

// Update an existing telephony/agent configuration in database
const updateTelephonyInDB = async (id, payload) => {
  const { twilioNumber, managerNumber } = payload;

  const updateData = {};
  if (twilioNumber !== undefined) updateData.twilioNumber = twilioNumber;
  if (managerNumber !== undefined) updateData.managerNumber = managerNumber;

  return await prisma.agent.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      twilioNumber: true,
      managerNumber: true,
      vapiAgentId: true,
    },
  });
};

// Reset a telephony/agent configuration to defaults in database (delete equivalent)
const deleteTelephonyFromDB = async (id) => {
  const existingAgent = await prisma.agent.findFirst({
    where: {
      OR: [{ id: id }, { vapiPhoneNumberId: id }],
    },
  });

  if (!existingAgent) {
    return null;
  }

  if (existingAgent.vapiPhoneNumberId) {
    const unlinkEndpoint = `${envVars.AI_SERVICE_URL}/api/telephony/unlink/${existingAgent.vapiPhoneNumberId}`;
    try {
      console.log(`Calling AI Service unlink endpoint: ${unlinkEndpoint}`);
      await axios.delete(unlinkEndpoint);
      console.log(
        "Successfully unlinked telephony configuration in AI service",
      );
    } catch (error) {
      console.error(
        "AI Telephony Unlink Error:",
        error.response?.data || error.message,
      );

      const responseStatus = error.response?.status;
      const responseData = error.response?.data;
      const errorMsg = responseData?.detail || responseData?.message || error.message || "";

      // Check if the error indicates that the resource is not found (already deleted in Vapi/AI service)
      const isNotFound =
        responseStatus === 404 ||
        (typeof errorMsg === "string" && (errorMsg.includes("404") || errorMsg.toLowerCase().includes("not found"))) ||
        (responseData && typeof responseData === "object" && JSON.stringify(responseData).includes("404"));

      if (isNotFound) {
        console.log(
          `Telephony configuration (Vapi Phone ID: ${existingAgent.vapiPhoneNumberId}) not found on AI service. Proceeding with database cleanup.`,
        );
      } else {
        throw new Error(
          `Failed to unlink telephony on AI Service: ${errorMsg}`,
        );
      }
    }
  }

  return await prisma.agent.update({
    where: { id: existingAgent.id },
    data: {
      twilioNumber: "TBD",
      managerNumber: "TBD",
      vapiPhoneNumberId: null,
    },
    select: {
      id: true,
      twilioNumber: true,
      managerNumber: true,
      vapiAgentId: true,
    },
  });
};

// Fetch agents belonging to a business that do not have a telephony number configured (i.e. twilioNumber is TBD or empty)
const getUnconfiguredAgentsByBusinessIdFromDB = async (businessId) => {
  return await prisma.agent.findMany({
    where: {
      businessId,
      OR: [{ twilioNumber: "TBD" }, { twilioNumber: "" }],
    },
    select: {
      id: true,
      name: true,
      twilioNumber: true,
      managerNumber: true,
      vapiAgentId: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const TelephonyService = {
  getAllTelephonyFromDB,
  getTelephonyByIdFromDB,
  createTelephonyInDB,
  updateTelephonyInDB,
  deleteTelephonyFromDB,
  getUnconfiguredAgentsByBusinessIdFromDB,
};
