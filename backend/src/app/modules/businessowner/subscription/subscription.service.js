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

  const dateFilter = isFreeTrial
    ? undefined
    : { gte: activeSubscription.startDate, lte: activeSubscription.endDate };

  // Sum up AI calls vs Forwarded calls
  const aiDurationResult = await prisma.call.aggregate({
    where: {
      businessId,
      type: "ai_call",
      startTime: dateFilter,
    },
    _sum: { duration: true },
  });

  const forwardedDurationResult = await prisma.call.aggregate({
    where: {
      businessId,
      type: "forwarded_call",
      startTime: dateFilter,
    },
    _sum: { duration: true },
  });

  const aiUsedMinutes = (aiDurationResult._sum.duration || 0) / 60;
  const forwardedUsedMinutes = (forwardedDurationResult._sum.duration || 0) / 60;

  const aiLimit = plan.aiMinutesLimit > 0 ? plan.aiMinutesLimit : plan.callMinutesLimit;
  const forwardedLimit = plan.forwardedMinutesLimit || 0;

  if (aiLimit > 0 && aiUsedMinutes >= aiLimit) {
    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { status: "expired" },
    });
    return {
      isExceeded: true,
      reason: `You have exceeded your AI minutes limit of ${aiLimit} minutes. Please upgrade your plan.`,
      remainingMinutes: 0,
      remainingAiMinutes: 0,
      remainingForwardedMinutes: Math.max(0, forwardedLimit - forwardedUsedMinutes),
    };
  }

  return {
    isExceeded: false,
    remainingMinutes: Math.max(0, aiLimit - aiUsedMinutes),
    remainingAiMinutes: Math.max(0, aiLimit - aiUsedMinutes),
    remainingForwardedMinutes: Math.max(0, forwardedLimit - forwardedUsedMinutes),
    aiUsedMinutes: Math.round(aiUsedMinutes * 100) / 100,
    forwardedUsedMinutes: Math.round(forwardedUsedMinutes * 100) / 100,
    subscription: activeSubscription,
  };
};

const getMySubscriptionFromDB = async (userId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    return null;
  }

  const limitCheck = await checkPlanLimits(business.id);

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
    const latestSubscription = await prisma.subscription.findFirst({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });
    return latestSubscription
      ? {
          ...latestSubscription,
          remainingMinutes: 0,
          remainingAiMinutes: 0,
          remainingForwardedMinutes: 0,
          aiUsedMinutes: 0,
          forwardedUsedMinutes: 0,
        }
      : null;
  }

  return {
    ...subscription,
    remainingMinutes: Math.round(limitCheck.remainingMinutes * 100) / 100,
    remainingAiMinutes: Math.round(limitCheck.remainingAiMinutes * 100) / 100,
    remainingForwardedMinutes: Math.round(limitCheck.remainingForwardedMinutes * 100) / 100,
    aiUsedMinutes: limitCheck.aiUsedMinutes,
    forwardedUsedMinutes: limitCheck.forwardedUsedMinutes,
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
