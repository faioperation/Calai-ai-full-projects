import prisma from "../../prisma/client.js";
import { SubscriptionService } from "../businessowner/subscription/subscription.service.js";
import { PrinterService } from "../businessowner/printer/printer.service.js";
import { notifyNewOrder } from "../../utils/socket.js";
import { VapiLib } from "../../lib/vapi.js";

/**
 * Helper to parse and validate Order Type and Delivery Address.
 */
const parseOrderTypeAndAddress = (data, callStartTime) => {
  let orderType = "PICKUP";
  let deliveryAddress = null;
  let pickupTime = null;

  if (data) {
    const rawOrderType =
      data.order_type ||
      data.orderType ||
      data.type ||
      data.delivery_type ||
      data.deliveryType;
    if (rawOrderType) {
      const normalizedType = rawOrderType.toString().trim().toUpperCase();
      if (normalizedType === "DELIVERY" || normalizedType === "PICKUP") {
        orderType = normalizedType;
      }
    }

    if (orderType === "DELIVERY") {
      deliveryAddress =
        data.delivery_address ||
        data.deliveryAddress ||
        data.address ||
        data.customer_address ||
        data.customerAddress ||
        null;
    } else if (orderType === "PICKUP") {
      const baseDate = callStartTime ? new Date(callStartTime) : new Date();
      const pickupDate = new Date(baseDate.getTime() + 15 * 60 * 1000);
      pickupTime = pickupDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/London",
      });
    }
  }

  return { orderType, deliveryAddress, pickupTime };
};

/**
 * Helper to promote and merge a recent temporary direct call into a real Vapi Call ID.
 * This prevents duplicate entries when custom tools create temporary IDs.
 */
const promoteDirectCallIfExist = async (
  businessId,
  realVapiCallId,
  customerNumber,
  assistantId,
) => {
  if (
    !realVapiCallId ||
    realVapiCallId === "N/A" ||
    realVapiCallId.startsWith("direct-")
  ) {
    return null;
  }

  // Check if a Call with the real vapiCallId already exists
  let callRecord = await prisma.call.findUnique({
    where: { vapiCallId: realVapiCallId },
  });

  if (!callRecord) {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const directCall = await prisma.call.findFirst({
      where: {
        businessId: businessId,
        vapiCallId: {
          startsWith: "direct-",
        },
        OR: [
          { customerNumber: customerNumber },
          { customerNumber: "Unknown" },
          { customerNumber: "N/A" },
        ],
        ...(assistantId ? { vapiAgentId: assistantId } : {}),
        startTime: {
          gte: fifteenMinutesAgo,
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    if (directCall) {
      console.log(
        `🚀 Promoting temporary direct call ${directCall.vapiCallId} (ID: ${directCall.id}) to real Vapi Call ID: ${realVapiCallId}`,
      );
      callRecord = await prisma.call.update({
        where: { id: directCall.id },
        data: {
          vapiCallId: realVapiCallId,
          ...(customerNumber &&
          customerNumber !== "Unknown" &&
          customerNumber !== "N/A"
            ? { customerNumber: customerNumber }
            : {}),
        },
      });
    }
  }

  return callRecord;
};

/**
 * Process Vapi Webhook
 * @param {Object} payload - The webhook payload from Vapi
 */
const processVapiWebhook = async (payload) => {
  const { message } = payload;
  const messageType = message?.type || "direct-order-tool-call";

  // Intercept assistant-request to check plan limits
  if (message?.type === "assistant-request") {
    const assistantId =
      message.assistantId ||
      payload.assistantId ||
      payload.vapiAgentId ||
      payload.agentId ||
      payload.assistant?.id;

    if (!assistantId) {
      console.error("❌ Webhook Error: No assistantId found in assistant-request payload");
      return { success: false, message: "No assistantId provided" };
    }

    const agent = await prisma.agent.findFirst({
      where: {
        OR: [{ vapiAgentId: assistantId }, { id: assistantId }],
      },
      include: { business: true },
    });

    if (!agent) {
      console.error(`❌ Webhook Error: Agent not found for ID: ${assistantId}`);
      return { success: false, message: "Agent not found" };
    }

    const limits = await SubscriptionService.checkPlanLimits(agent.businessId);

    if (limits.isExceeded) {
      console.log(`🚫 Call Blocked: Business ${agent.businessId} has exceeded plan limits. Reason: ${limits.reason}`);
      return {
        isAssistantRequestResponse: true,
        assistant: {
          name: "Limit Exceeded",
          firstMessage: "Hello. This business has run out of calling minutes. Please upgrade your subscription to resume calls. Goodbye.",
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an automated message receptionist. You must politely inform the caller: 'This business has run out of calling minutes. Please upgrade your subscription to resume calls. Goodbye.' and then immediately hang up.",
              },
            ],
          },
        },
      };
    }

    // Otherwise, return the configured assistant ID
    return {
      isAssistantRequestResponse: true,
      assistantId: agent.vapiAgentId || agent.id,
    };
  }

  // 1. Check if this is a "Direct Order" payload (no message/call nesting)
  // This can happen from Vapi Tool Calls or manual API requests
  if (
    !message &&
    (payload.order_items || payload.items || payload.final_items)
  ) {
    const assistantId =
      payload.assistantId ||
      payload.vapiAgentId ||
      payload.assistant_id ||
      payload.assistant?.id ||
      payload.call?.assistantId ||
      payload.call?.assistant_id ||
      payload.agentId;

    let agent = null;
    if (assistantId) {
      agent = await prisma.agent.findFirst({
        where: {
          OR: [{ vapiAgentId: assistantId }, { id: assistantId }],
        },
        include: { business: true },
      });
    }

    if (!agent) {
      console.error(
        `❌ Webhook Error: No agent found in database for assistantId: ${assistantId}`,
      );
      return {
        success: false,
        message: `No agent found in database for assistantId: ${assistantId}`,
      };
    }

    let vapiCallId =
      payload.callId ||
      payload.vapiCallId ||
      payload.call?.id ||
      payload.call?.vapiCallId;

    if (!vapiCallId) {
      const customerPhone =
        payload.customer_phone ||
        payload.phone ||
        payload.call?.customer?.number;
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      let recentCall = null;

      if (customerPhone) {
        recentCall = await prisma.call.findFirst({
          where: {
            businessId: agent.businessId,
            customerNumber: customerPhone,
            startTime: {
              gte: tenMinutesAgo,
            },
            orders: null, // Only pair if the call does not already have an order
          },
          orderBy: { startTime: "desc" },
        });
      }

      // Do NOT pair with random recent call of a different customer if phone number doesn't match,
      // as that leads to order hijacking/overwriting.
      if (recentCall && recentCall.vapiCallId) {
        vapiCallId = recentCall.vapiCallId;
        console.log(
          `🔗 Paired direct order with active call ID: ${vapiCallId}`,
        );
      } else {
        vapiCallId = `direct-${Date.now()}`;
        console.log(
          `⚠️ No active call found for pairing. Created temporary ID: ${vapiCallId}`,
        );
      }
    }

    // Upsert Call to avoid duplicates if status-update or other webhook processed it first
    const call = await prisma.call.upsert({
      where: { vapiCallId: vapiCallId },
      update: {
        customerNumber:
          payload.customer_phone ||
          payload.phone ||
          payload.call?.customer?.number ||
          undefined,
        vapiAgentId: assistantId || undefined,
      },
      create: {
        vapiCallId: vapiCallId,
        businessId: agent.businessId,
        userId: agent.business.ownerId,
        duration: 0,
        startTime: new Date(),
        endTime: new Date(),
        customerNumber:
          payload.customer_phone ||
          payload.phone ||
          payload.call?.customer?.number ||
          "N/A",
        type: "ai_call",
        status: "completed",
        vapiAgentId: assistantId || null,
      },
    });

    const { orderType, deliveryAddress, pickupTime } = parseOrderTypeAndAddress(payload, call.startTime);

    const orderRecord = await prisma.order.upsert({
      where: { callId: call.id },
      update: {
        customerName:
          payload.customer_name ||
          payload.customerName ||
          payload.call?.customer?.name ||
          "N/A",
        customerEmail:
          payload.customer_email ||
          payload.customerEmail ||
          payload.call?.customer?.email ||
          "N/A",
        totalPrice: Number(
          payload.total_price || payload.totalPrice || payload.total || 0,
        ),
        items:
          payload.final_items || payload.order_items || payload.items || [],
        orderType,
        deliveryAddress,
        pickupTime,
      },
      create: {
        businessId: agent.businessId,
        callId: call.id,
        customerName:
          payload.customer_name ||
          payload.customerName ||
          payload.call?.customer?.name ||
          "N/A",
        customerEmail:
          payload.customer_email ||
          payload.customerEmail ||
          payload.call?.customer?.email ||
          "N/A",
        totalPrice: Number(
          payload.total_price || payload.totalPrice || payload.total || 0,
        ),
        items:
          payload.final_items || payload.order_items || payload.items || [],
        orderType,
        deliveryAddress,
        pickupTime,
      },
    });

    await PrinterService.autoQueueOrderPrint(agent.businessId, orderRecord.id);
    await notifyNewOrder(orderRecord.id);

    return { success: true, callId: call.id };
  }

  // 2. Handle Tool Calls during the call (e.g. order placement)
  if (message?.type === "tool-calls") {
    const vapiCall = message.call || payload.call;
    const vapiCallId = vapiCall?.id || "N/A";

    const assistantId =
      vapiCall?.assistantId ||
      vapiCall?.assistant_id ||
      message.assistantId ||
      payload.agentId ||
      payload.vapiAgentId;

    let agent = null;
    if (assistantId) {
      agent = await prisma.agent.findFirst({
        where: {
          OR: [{ vapiAgentId: assistantId }, { id: assistantId }],
        },
        include: { business: true },
      });
    }

    if (!agent) {
      console.error(
        `❌ Webhook Error: No agent found for Vapi Assistant ID: ${assistantId}`,
      );
      return { success: false, message: "Unknown assistant" };
    }

    const businessId = agent.businessId;
    const userId = agent.business.ownerId;

    let toolCalls = message.toolCalls || [];
    if (message.toolCallId && message.tool) {
      toolCalls.push({
        id: message.toolCallId,
        function: {
          name: message.tool.name,
          arguments: message.tool.arguments,
        },
      });
    }

    const results = [];

    // Make sure we have a Call record first so the foreign key references exist
    let call;
    if (vapiCallId !== "N/A") {
      const customerNumber = vapiCall?.customer?.number || "Unknown";

      // Try to promote an existing direct call if it exists
      await promoteDirectCallIfExist(
        businessId,
        vapiCallId,
        customerNumber,
        assistantId,
      );

      const startTimeRaw =
        vapiCall?.startedAt || vapiCall?.createdAt || Date.now();
      const startTime = isNaN(new Date(startTimeRaw).getTime())
        ? new Date()
        : new Date(startTimeRaw);

      call = await prisma.call.upsert({
        where: { vapiCallId: vapiCallId },
        update: {
          customerNumber: customerNumber,
          vapiAgentId: assistantId || undefined,
        },
        create: {
          vapiCallId: vapiCallId,
          businessId: businessId,
          userId: userId,
          duration: 0,
          startTime: startTime,
          endTime: startTime,
          customerNumber: customerNumber,
          type: "ai_call",
          status: "completed",
          vapiAgentId: assistantId || null,
        },
      });
    } else {
      call = await prisma.call.findFirst({
        where: { businessId: businessId },
        orderBy: { startTime: "desc" },
      });
    }

    for (const toolCall of toolCalls) {
      const funcName = toolCall.function?.name || "";
      const args = toolCall.function?.arguments || {};

      console.log(
        `🔧 Received Tool Call: ${funcName} with args:`,
        JSON.stringify(args),
      );

      if (funcName.toLowerCase().includes("order")) {
        const orderItems =
          args.final_items || args.order_items || args.items || [];
        const totalPrice = Number(
          args.total_price || args.totalPrice || args.total || 0,
        );
        const customerName =
          args.customer_name ||
          args.customerName ||
          vapiCall?.customer?.name ||
          "N/A";
        const customerEmail =
          args.customer_email || args.customerEmail || args.email || "N/A";

        const { orderType, deliveryAddress: parsedAddress, pickupTime } = parseOrderTypeAndAddress(args, call?.startTime);
        const deliveryAddress = parsedAddress || vapiCall?.customer?.address || null;

        if (call) {
          const orderRecord = await prisma.order.upsert({
            where: { callId: call.id },
            update: {
              customerName: customerName,
              customerEmail: customerEmail,
              totalPrice: totalPrice,
              items: orderItems,
              orderType,
              deliveryAddress,
              pickupTime,
            },
            create: {
              businessId: businessId,
              callId: call.id,
              customerName: customerName,
              customerEmail: customerEmail,
              totalPrice: totalPrice,
              items: orderItems,
              orderType,
              deliveryAddress,
              pickupTime,
            },
          });
          console.log(
            `✅ Order synced successfully in tool call! Total: £${totalPrice}`,
          );
          
          await PrinterService.autoQueueOrderPrint(businessId, orderRecord.id);
          await notifyNewOrder(orderRecord.id);
        }

        results.push({
          toolCallId: toolCall.id,
          result: {
            success: true,
            message: "Order successfully placed and recorded in database",
          },
        });
      } else {
        results.push({
          toolCallId: toolCall.id,
          result: { success: true, message: "Tool executed successfully" },
        });
      }
    }

    return {
      isToolCallResponse: true,
      results: results,
    };
  }

  // 3. Handle Standard Vapi Webhooks (end-of-call-report, etc.)
  if (
    message?.type !== "end-of-call-report" &&
    message?.type !== "status-update"
  ) {
    return { success: true, message: "Ignored message type" };
  }

  const vapiCall = message.call || payload.call;
  if (!vapiCall) {
    return { success: false, message: "No call data found" };
  }

  const vapiCallId = vapiCall.id;
  const assistantId =
    vapiCall.assistantId ||
    vapiCall.assistant_id ||
    message.assistantId ||
    payload.agentId ||
    payload.vapiAgentId;

  // Find the business linked to this assistant
  let agent = null;
  if (assistantId) {
    agent = await prisma.agent.findFirst({
      where: {
        OR: [{ vapiAgentId: assistantId }, { id: assistantId }],
      },
      include: { business: true },
    });
  }

  if (!agent) {
    console.error(
      `❌ Webhook Error: No agent found for Vapi Assistant ID: ${assistantId}`,
    );
    return { success: false, message: "Unknown assistant" };
  }

  const businessId = agent.businessId;
  const userId = agent.business.ownerId;

  const customerNumber = vapiCall.customer?.number || "Unknown";

  // Try to promote an existing direct call if it exists
  await promoteDirectCallIfExist(
    businessId,
    vapiCallId,
    customerNumber,
    assistantId,
  );

  // 1. Sync Call with robust date parsing to prevent DB insert crashes
  const startTimeRaw = vapiCall.startedAt || vapiCall.createdAt || new Date();
  const endTimeRaw = vapiCall.endedAt || vapiCall.createdAt || new Date();
  const startTime = isNaN(new Date(startTimeRaw).getTime())
    ? new Date()
    : new Date(startTimeRaw);
  const endTime = isNaN(new Date(endTimeRaw).getTime())
    ? new Date()
    : new Date(endTimeRaw);

  let durationInSeconds = 0;
  if (vapiCall.duration !== undefined)
    durationInSeconds = Number(vapiCall.duration);
  else if (vapiCall.durationSeconds !== undefined)
    durationInSeconds = Number(vapiCall.durationSeconds);
  else if (vapiCall.endedAt && vapiCall.startedAt)
    durationInSeconds = Math.max(
      0,
      (endTime.getTime() - startTime.getTime()) / 1000,
    );

  const status = vapiCall.status === "ended" ? "completed" : "failed";

  const call = await prisma.call.upsert({
    where: { vapiCallId: vapiCallId },
    update: {
      duration: Math.floor(durationInSeconds),
      endTime: endTime,
      status: status,
      customerNumber: vapiCall.customer?.number || "Unknown",
      vapiAgentId: assistantId || undefined,
    },
    create: {
      vapiCallId: vapiCallId,
      businessId: businessId,
      userId: userId,
      duration: Math.floor(durationInSeconds),
      startTime: startTime,
      endTime: endTime,
      customerNumber: vapiCall.customer?.number || "Unknown",
      type: "ai_call",
      status: status,
      vapiAgentId: assistantId || null,
    },
  });

  // 2. Sync Summary
  const analysis = vapiCall.analysis || message.analysis;
  if (
    analysis ||
    vapiCall.summary ||
    vapiCall.transcript ||
    message?.transcript
  ) {
    await prisma.callSummary.upsert({
      where: { callId: call.id },
      update: {
        summary:
          analysis?.summary || vapiCall.summary || "No summary available",
        transcript:
          analysis?.transcript ||
          vapiCall.transcript ||
          message?.transcript ||
          "No transcript available",
      },
      create: {
        callId: call.id,
        summary:
          analysis?.summary || vapiCall.summary || "No summary available",
        transcript:
          analysis?.transcript ||
          vapiCall.transcript ||
          message?.transcript ||
          "No transcript available",
      },
    });
  }

  // 3. Sync Order (If structured data exists)
  const structuredData = analysis?.structuredData;
  if (structuredData) {
    // Handle variations in field names from Vapi schemas
    const orderItems =
      structuredData.final_items ||
      structuredData.order_items ||
      structuredData.items ||
      [];
    const totalPrice = Number(
      structuredData.total_price ||
        structuredData.totalPrice ||
        structuredData.total ||
        0,
    );
    const customerName =
      structuredData.customer_name ||
      structuredData.customerName ||
      vapiCall.customer?.name ||
      "N/A";
    const customerEmail =
      structuredData.customer_email ||
      structuredData.customerEmail ||
      structuredData.email ||
      "N/A";

    const { orderType, deliveryAddress: parsedAddress, pickupTime } = parseOrderTypeAndAddress(structuredData, call.startTime);
    const deliveryAddress = parsedAddress || vapiCall?.customer?.address || null;

    // Only create order if there are items or a price
    if (orderItems.length > 0 || totalPrice > 0) {
      const orderRecord = await prisma.order.upsert({
        where: { callId: call.id },
        update: {
          customerName: customerName,
          customerEmail: customerEmail,
          totalPrice: totalPrice,
          items: orderItems,
          orderType,
          deliveryAddress,
          pickupTime,
        },
        create: {
          businessId: businessId,
          callId: call.id,
          customerName: customerName,
          customerEmail: customerEmail,
          totalPrice: totalPrice,
          items: orderItems,
          orderType,
          deliveryAddress,
          pickupTime,
        },
      });

      await PrinterService.autoQueueOrderPrint(businessId, orderRecord.id);
      await notifyNewOrder(orderRecord.id);
    }
  }

  // Check and update limits (auto-expires subscription if limit exceeded)
  await SubscriptionService.checkPlanLimits(businessId);

  // 4. Schedule automatic delayed self-healing (4s delay) to ensure final Vapi summary & duration are saved in DB
  if (vapiCallId && !vapiCallId.startsWith("direct-")) {
    setTimeout(async () => {
      try {
        const vapiCallData = await VapiLib.fetchCallById(vapiCallId);
        if (vapiCallData) {
          const fetchedSummary =
            vapiCallData.analysis?.summary ||
            vapiCallData.summary ||
            "No summary available";
          const fetchedTranscript =
            vapiCallData.analysis?.transcript ||
            vapiCallData.transcript ||
            "No transcript available";

          let fetchedDuration = 0;
          if (vapiCallData.duration !== undefined)
            fetchedDuration = Number(vapiCallData.duration);
          else if (vapiCallData.durationSeconds !== undefined)
            fetchedDuration = Number(vapiCallData.durationSeconds);
          else if (vapiCallData.endedAt && vapiCallData.startedAt)
            fetchedDuration = Math.max(
              0,
              (new Date(vapiCallData.endedAt).getTime() -
                new Date(vapiCallData.startedAt).getTime()) /
                1000,
            );

          const updatedDuration = Math.floor(fetchedDuration);

          const targetCall = await prisma.call.findUnique({
            where: { vapiCallId: vapiCallId },
          });

          if (targetCall) {
            if (updatedDuration > 0) {
              await prisma.call.update({
                where: { id: targetCall.id },
                data: {
                  duration: updatedDuration,
                  status:
                    vapiCallData.status === "ended"
                      ? "completed"
                      : targetCall.status,
                },
              });
            }

            if (
              fetchedSummary !== "No summary available" ||
              fetchedTranscript !== "No transcript available"
            ) {
              await prisma.callSummary.upsert({
                where: { callId: targetCall.id },
                update: {
                  summary: fetchedSummary,
                  transcript: fetchedTranscript,
                },
                create: {
                  callId: targetCall.id,
                  summary: fetchedSummary,
                  transcript: fetchedTranscript,
                },
              });
            }
          }
        }
      } catch (err) {
        console.error(
          `[AutoSelfHeal] Vapi sync failed for ${vapiCallId}:`,
          err.message,
        );
      }
    }, 4000);
  }

  return { success: true, callId: call.id };
};

export const WebhookService = {
  processVapiWebhook,
};
