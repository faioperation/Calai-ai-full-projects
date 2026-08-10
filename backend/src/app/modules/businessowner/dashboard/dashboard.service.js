import prisma from "../../../prisma/client.js";
import { VapiLib } from "../../../lib/vapi.js";
import {
  startOfDay,
  endOfDay,
  subDays,
  format,
  isWithinInterval,
} from "date-fns";

/**
 * Auto-heal recent calls with 0 duration from Vapi API if present
 */
const healRecentZeroDurationCalls = async (businessId) => {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const zeroDurationCalls = await prisma.call.findMany({
      where: {
        businessId,
        duration: 0,
        startTime: { gte: fifteenMinutesAgo },
        vapiCallId: { not: { startsWith: "direct-" } },
      },
    });

    if (zeroDurationCalls.length > 0) {
      await Promise.all(
        zeroDurationCalls.map(async (call) => {
          if (!call.vapiCallId) return;
          const vapiData = await VapiLib.fetchCallById(call.vapiCallId);
          if (vapiData) {
            let dur = 0;
            if (vapiData.duration !== undefined)
              dur = Number(vapiData.duration);
            else if (vapiData.durationSeconds !== undefined)
              dur = Number(vapiData.durationSeconds);
            else if (vapiData.endedAt && vapiData.startedAt)
              dur = Math.max(
                0,
                (new Date(vapiData.endedAt).getTime() -
                  new Date(vapiData.startedAt).getTime()) /
                  1000,
              );

            if (dur > 0) {
              await prisma.call.update({
                where: { id: call.id },
                data: { duration: Math.floor(dur) },
              });
            }
          }
        }),
      );
    }
  } catch (err) {
    console.error("Dashboard auto self-heal error:", err.message);
  }
};

/**
 * Get dashboard summary stats
 * @param {string} userId - The ID of the business owner
 */
const getDashboardStats = async (userId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found");
  }

  const businessId = business.id;
  await healRecentZeroDurationCalls(businessId);

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // 1. Total Call Duration
  const totalDurationResult = await prisma.call.aggregate({
    where: { businessId },
    _sum: {
      duration: true,
    },
  });
  const totalDurationInSeconds = totalDurationResult._sum.duration || 0;

  // Format duration (e.g., "12 hr 45 min")
  const hours = Math.floor(totalDurationInSeconds / 3600);
  const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
  const totalDurationFormatted = `${hours} hr ${minutes} min`;

  // 2. Today Total Call
  const todayCallCount = await prisma.call.count({
    where: {
      businessId,
      startTime: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // 3. Total Order
  const totalOrderCount = await prisma.order.count({
    where: { businessId },
  });

  // 4. Calculate Dynamic Percentage Changes (Last 7 days vs Previous 7 days)
  const last7DaysStart = subDays(todayStart, 7);
  const prev7DaysStart = subDays(todayStart, 14);

  // Helper for range stats
  const getRangeStats = async (start, end) => {
    const calls = await prisma.call.aggregate({
      where: { businessId, startTime: { gte: start, lt: end } },
      _sum: { duration: true },
      _count: true,
    });
    const orders = await prisma.order.count({
      where: { businessId, createdAt: { gte: start, lt: end } },
    });
    return {
      duration: calls._sum.duration || 0,
      count: calls._count || 0,
      orders: orders,
    };
  };

  const currentPeriod = await getRangeStats(last7DaysStart, now);
  const previousPeriod = await getRangeStats(prev7DaysStart, last7DaysStart);

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  const calculateWeeklyDiff = (current, previous) => {
    const diff = current - previous;
    return `${diff >= 0 ? "+" : ""}${diff} this week`;
  };

  return {
    totalCallDuration: {
      value: totalDurationFormatted,
      change: calculateChange(currentPeriod.duration, previousPeriod.duration),
      weeklyChange:
        calculateWeeklyDiff(
          currentPeriod.duration / 60,
          previousPeriod.duration / 60,
        ) + " min",
    },
    todayTotalCall: {
      value: `Call ${todayCallCount}`,
      change: calculateChange(currentPeriod.count, previousPeriod.count),
      weeklyChange: calculateWeeklyDiff(
        currentPeriod.count,
        previousPeriod.count,
      ),
    },
    totalOrder: {
      value: totalOrderCount.toString(),
      change: calculateChange(currentPeriod.orders, previousPeriod.orders),
      weeklyChange: calculateWeeklyDiff(
        currentPeriod.orders,
        previousPeriod.orders,
      ),
    },
  };
};

/**
 * Get graph data for the last 14 days
 */
const getDashboardGraphData = async (userId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) throw new Error("Business not found");

  const businessId = business.id;
  const last14Days = [];

  for (let i = 13; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const start = startOfDay(date);
    const end = endOfDay(date);

    const dayDuration = await prisma.call.aggregate({
      where: {
        businessId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        duration: true,
      },
    });

    last14Days.push({
      date: format(date, "d MMM"),
      duration: Math.floor((dayDuration._sum.duration || 0) / 60), // in minutes
    });
  }

  return last14Days;
};

/**
 * Get overall report data
 */
const getOverallReport = async (userId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) throw new Error("Business not found");

  const businessId = business.id;
  const totalCalls = await prisma.call.count({ where: { businessId } });
  const totalOrders = await prisma.order.count({ where: { businessId } });
  const totalDuration = await prisma.call.aggregate({
    where: { businessId },
    _sum: { duration: true },
  });

  // Calculate success rate (orders / total calls)
  const successRate =
    totalCalls > 0 ? Math.round((totalOrders / totalCalls) * 100) : 0;

  return {
    overallPercentage: successRate,
    totalCall: totalCalls,
    totalCallDuration: Math.floor((totalDuration._sum.duration || 0) / 60), // minutes
  };
};

export const DashboardService = {
  getDashboardStats,
  getDashboardGraphData,
  getOverallReport,
};
