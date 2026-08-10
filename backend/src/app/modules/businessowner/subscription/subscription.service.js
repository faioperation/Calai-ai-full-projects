import prisma from "../../../prisma/client.js";

const checkPlanLimits = async (businessId) => {
  // Find active subscription
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      businessId,
      status: "active",
    },
    include: {
      plan: true,
    },
  });

  if (!activeSubscription) {
    return {
      isExceeded: true,
      reason: "No active subscription found. Please purchase a plan.",
      remainingMinutes: 0,
      remainingCalls: 0,
    };
  }

  // Check if current date is past subscription end date
  const now = new Date();
  if (now > activeSubscription.endDate) {
    // Auto-expire the subscription
    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { status: "expired" },
    });
    return {
      isExceeded: true,
      reason: "Your subscription has expired. Please purchase a plan.",
      remainingMinutes: 0,
      remainingCalls: 0,
    };
  }

  const plan = activeSubscription.plan;
  const isFreeTrial = /free tra[il]/i.test(plan.name);

  // 1. Check call minutes limit
  let totalUsedSeconds = 0;
  if (isFreeTrial) {
    // For free trial, sum up all calls ever made by this business
    const totalDurationResult = await prisma.call.aggregate({
      where: { businessId },
      _sum: { duration: true },
    });
    totalUsedSeconds = totalDurationResult._sum.duration || 0;
  } else {
    // For paid plans, sum up calls made within the current billing period
    const totalDurationResult = await prisma.call.aggregate({
      where: {
        businessId,
        startTime: {
          gte: activeSubscription.startDate,
          lte: activeSubscription.endDate,
        },
      },
      _sum: { duration: true },
    });
    totalUsedSeconds = totalDurationResult._sum.duration || 0;
  }

  const totalUsedMinutes = totalUsedSeconds / 60;
  const effectiveMinutesLimit = plan.aiMinutesLimit > 0 ? plan.aiMinutesLimit : plan.callMinutesLimit;

  if (effectiveMinutesLimit > 0 && totalUsedMinutes >= effectiveMinutesLimit) {
    // Auto-expire the subscription
    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { status: "expired" },
    });
    return {
      isExceeded: true,
      reason: `You have exceeded your AI minutes limit of ${effectiveMinutesLimit} minutes. Please upgrade your plan.`,
      remainingMinutes: 0,
      remainingCalls: 0,
    };
  }

  // 2. Check call count limit (e.g. max 130 calls for Starter)
  if (plan.callCountLimit > 0) {
    const totalCallsCount = await prisma.call.count({
      where: {
        businessId,
        startTime: {
          gte: activeSubscription.startDate,
          lte: activeSubscription.endDate,
        },
      },
    });

    if (totalCallsCount >= plan.callCountLimit) {
      // Auto-expire the subscription
      await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: { status: "expired" },
      });
      return {
        isExceeded: true,
        reason: `You have exceeded your plan limit of ${plan.callCountLimit} calls. Please upgrade your plan.`,
        remainingMinutes: Math.max(0, plan.callMinutesLimit - totalUsedMinutes),
        remainingCalls: 0,
      };
    }

    return {
      isExceeded: false,
      remainingMinutes: Math.max(0, plan.callMinutesLimit - totalUsedMinutes),
      remainingCalls: Math.max(0, plan.callCountLimit - totalCallsCount),
      subscription: activeSubscription,
    };
  }

  return {
    isExceeded: false,
    remainingMinutes: Math.max(0, plan.callMinutesLimit - totalUsedMinutes),
    remainingCalls: null, // Unlimited calls
    subscription: activeSubscription,
  };
};

const getMySubscriptionFromDB = async (userId) => {
  // Find the business owned by this user
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    return null;
  }

  // Run the limits check (which auto-expires the subscription if limits are hit or date expired)
  const limitCheck = await checkPlanLimits(business.id);

  // Retrieve subscription (could have been expired by the check above)
  const subscription = await prisma.subscription.findFirst({
    where: {
      businessId: business.id,
      status: "active",
    },
    include: {
      plan: true,
    },
  });

  if (!subscription) {
    // If no active subscription, return the latest subscription (expired/canceled) so the frontend knows what expired
    const latestSubscription = await prisma.subscription.findFirst({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });
    return latestSubscription
      ? { ...latestSubscription, remainingMinutes: 0, remainingCalls: 0 }
      : null;
  }

  return {
    ...subscription,
    remainingMinutes: Math.round(limitCheck.remainingMinutes * 100) / 100,
    remainingCalls: limitCheck.remainingCalls,
  };
};

const getAllPlansFromDB = async () => {
  return await prisma.plan.findMany({
    orderBy: {
      priceMonthly: "asc",
    },
  });
};

const getBillingHistoryFromDB = async (userId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    return [];
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      businessId: business.id,
    },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return invoices;
};

export const SubscriptionService = {
  getMySubscriptionFromDB,
  getAllPlansFromDB,
  getBillingHistoryFromDB,
  checkPlanLimits,
};
