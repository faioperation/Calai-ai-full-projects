import cron from "node-cron";
import axios from "axios";
import prisma from "../prisma/client.js";
import { envVars } from "../config/env.js";

// In-memory cache to prevent unnecessary duplicate API calls
// Key: assistant_id, Value: boolean (true/false)
const agentStatusCache = new Map();

/**
 * Parses time string (24h or 12h AM/PM format) into minutes from midnight (0 - 1439).
 * Returns null if parsing fails.
 */
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return null;

  const trimmed = timeStr.trim().toUpperCase();
  const isPm = trimmed.includes("PM");
  const isAm = trimmed.includes("AM");

  const cleanTime = trimmed.replace(/(AM|PM)/g, "").trim();
  const parts = cleanTime.split(":");
  if (parts.length < 2) return null;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return null;

  if (isPm && hours < 12) hours += 12;
  if (isAm && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

/**
 * Determines whether a business is currently open based on current date/time in Europe/London or local server time.
 */
const isBusinessCurrentlyOpen = (businessSettings, now = new Date()) => {
  if (!businessSettings) return true;

  // Get day of week and current time in London timezone (or server timezone)
  const formatterDay = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: "Europe/London",
  });
  const formatterTime = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  });

  const currentDayName = formatterDay.format(now);
  const [currentHourStr, currentMinStr] = formatterTime.format(now).split(":");
  const currentMinutes =
    parseInt(currentHourStr, 10) * 60 + parseInt(currentMinStr, 10);

  // 1. Check if today is an off day
  const offDays = Array.isArray(businessSettings.offDays)
    ? businessSettings.offDays
    : [];
  const isOffDay = offDays.some(
    (day) => day.trim().toLowerCase() === currentDayName.toLowerCase(),
  );

  if (isOffDay) {
    return false;
  }

  // 2. Check opening and closing times
  const openMinutes = parseTimeToMinutes(businessSettings.openingTime);
  const closeMinutes = parseTimeToMinutes(businessSettings.closingTime);

  if (openMinutes === null || closeMinutes === null) {
    return true; // Default to open if working hours are not configured
  }

  if (openMinutes < closeMinutes) {
    // Standard daytime hours (e.g. 08:00 to 22:00)
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  } else if (openMinutes > closeMinutes) {
    // Overnight hours (e.g. 22:00 to 06:00)
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  } else {
    // 24 hours open if openingTime === closingTime
    return true;
  }
};

/**
 * Evaluates and updates the AI agent status for a single business agent.
 */
const evaluateAndUpdateAgentStatus = async (agent, force = false) => {
  const assistantId = agent.vapiAgentId || agent.id;
  if (!assistantId) return;

  const businessSettings = agent.business?.businessSettings;
  const desiredEnable = isBusinessCurrentlyOpen(businessSettings);

  const cachedStatus = agentStatusCache.get(assistantId);

  // Skip API call if status has not changed and force update is false
  if (!force && cachedStatus === desiredEnable) {
    return;
  }

  console.log(
    `⏰ [WorkingHoursScheduler] Toggling AI Agent status for ${agent.name || assistantId} (Business: ${agent.businessId}) -> Enable: ${desiredEnable}`,
  );

  try {
    const aiEndpoint = `${envVars.AI_SERVICE_URL}/api/agent-status`;
    const response = await axios.post(
      aiEndpoint,
      {
        enabled: desiredEnable,
      },
      {
        params: {
          assistant_id: assistantId,
        },
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      },
    );

    agentStatusCache.set(assistantId, desiredEnable);
    console.log(
      `✅ [WorkingHoursScheduler] Agent ${assistantId} status updated successfully (${desiredEnable ? "ON" : "OFF"})`,
    );
  } catch (error) {
    console.error(
      `❌ [WorkingHoursScheduler] Failed to update agent status for ${assistantId}:`,
      JSON.stringify(error.response?.data || error.message, null, 2),
    );
  }
};

/**
 * Checks working hours for all active agents across all businesses.
 */
export const checkAllAgentsWorkingHours = async (force = false) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { status: "active" },
      include: {
        business: {
          include: {
            businessSettings: true,
          },
        },
      },
    });

    for (const agent of agents) {
      await evaluateAndUpdateAgentStatus(agent, force);
    }
  } catch (error) {
    console.error(
      "❌ [WorkingHoursScheduler] Error querying active agents:",
      error.message,
    );
  }
};

/**
 * Force sync agent status for a specific business (e.g. after settings update).
 */
export const syncBusinessAgentStatus = async (businessId) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { businessId: businessId, status: "active" },
      include: {
        business: {
          include: {
            businessSettings: true,
          },
        },
      },
    });

    for (const agent of agents) {
      await evaluateAndUpdateAgentStatus(agent, true);
    }
  } catch (error) {
    console.error(
      `❌ [WorkingHoursScheduler] Error syncing business ${businessId}:`,
      error.message,
    );
  }
};

/**
 * Initializes the node-cron working hours scheduler.
 */
export const initWorkingHoursScheduler = () => {
  console.log("⏱️  Initializing Working Hours AI Agent Scheduler...");

  // Run initial check on server startup
  checkAllAgentsWorkingHours(true);

  // Schedule cron job to run every minute
  cron.schedule("* * * * *", () => {
    checkAllAgentsWorkingHours();
  });
};
