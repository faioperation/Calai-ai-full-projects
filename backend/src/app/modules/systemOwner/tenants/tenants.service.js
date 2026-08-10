import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";
import { Role } from "../../../utils/role.js";
import { createImpersonationTokens } from "../../../utils/userTokenGenerator.js";

const getAllTenantsFromDB = async () => {
  const tenants = await prisma.business.findMany({
    include: {
      subscriptions: {
        orderBy: {
          endDate: "desc",
        },
        take: 1,
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format the response for the UI
  const formattedTenants = tenants.map((tenant) => {
    const latestSubscription = tenant.subscriptions[0] || null;
    return {
      id: tenant.id,
      name: tenant.name,
      business_type: tenant.businessType,
      plan: latestSubscription ? latestSubscription.plan.name : "No Plan",
      status: tenant.status,
      expiry_date: latestSubscription ? latestSubscription.endDate : null,
      created_at: tenant.createdAt,
    };
  });

  return formattedTenants;
};

const getTenantByIdFromDB = async (id) => {
  const tenant = await prisma.business.findUnique({
    where: {
      id,
    },
    include: {
      owner: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  });

  if (!tenant) {
    throw new DevBuildError("Tenant not found", StatusCodes.NOT_FOUND);
  }

  // Calculate usage minutes
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      businessId: id,
      status: "active",
    },
    include: {
      plan: true,
    },
  });

  let usedMinutes = 0;
  let remainingMinutes = 0;
  let totalMinutes = 0;

  if (activeSubscription) {
    const plan = activeSubscription.plan;
    const isFreeTrial = /free tra[il]/i.test(plan.name);

    let totalUsedSeconds = 0;
    if (isFreeTrial) {
      const totalDurationResult = await prisma.call.aggregate({
        where: { businessId: id },
        _sum: { duration: true },
      });
      totalUsedSeconds = totalDurationResult._sum.duration || 0;
    } else {
      const totalDurationResult = await prisma.call.aggregate({
        where: {
          businessId: id,
          startTime: {
            gte: activeSubscription.startDate,
            lte: activeSubscription.endDate,
          },
        },
        _sum: { duration: true },
      });
      totalUsedSeconds = totalDurationResult._sum.duration || 0;
    }

    usedMinutes = Math.round((totalUsedSeconds / 60) * 100) / 100;
    totalMinutes = plan.callMinutesLimit;
    remainingMinutes = Math.max(0, totalMinutes - usedMinutes);
    remainingMinutes = Math.round(remainingMinutes * 100) / 100;
  } else {
    // If no active subscription, get latest expired subscription if any
    const latestSubscription = await prisma.subscription.findFirst({
      where: { businessId: id },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });

    if (latestSubscription) {
      const plan = latestSubscription.plan;
      const isFreeTrial = /free tra[il]/i.test(plan.name);

      let totalUsedSeconds = 0;
      if (isFreeTrial) {
        const totalDurationResult = await prisma.call.aggregate({
          where: { businessId: id },
          _sum: { duration: true },
        });
        totalUsedSeconds = totalDurationResult._sum.duration || 0;
      } else {
        const totalDurationResult = await prisma.call.aggregate({
          where: {
            businessId: id,
            startTime: {
              gte: latestSubscription.startDate,
              lte: latestSubscription.endDate,
            },
          },
          _sum: { duration: true },
        });
        totalUsedSeconds = totalDurationResult._sum.duration || 0;
      }

      usedMinutes = Math.round((totalUsedSeconds / 60) * 100) / 100;
      totalMinutes = plan.callMinutesLimit;
      remainingMinutes = 0;
    }
  }

  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.owner?.email,
    phone: tenant.owner?.phone,
    business_type: tenant.businessType,
    joined_date: tenant.createdAt,
    status: tenant.status,
    usage: {
      used: usedMinutes,
      remaining: remainingMinutes,
      total: totalMinutes,
    },
  };
};

const createTenantInDB = async (payload) => {
  const {
    first_name,
    last_name,
    email,
    password,
    business_name,
    phone,
    business_type,
  } = payload;

  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new DevBuildError(
      "User with this email already exists",
      StatusCodes.CONFLICT,
    );
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Sequential transactional creation
  return await prisma.$transaction(async (tx) => {
    // Create the Business Owner
    const owner = await tx.user.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        email,
        password: hashedPassword,
        role: Role.BUSINESS_OWNER,
        isVerified: true, // System owner created accounts are verified by default
        phone: phone,
      },
    });

    // Create the Business
    const business = await tx.business.create({
      data: {
        name: business_name,
        ownerId: owner.id,
        status: "active",
        businessType: business_type,
      },
    });

    // Create user_business link
    await tx.userBusiness.create({
      data: {
        userId: owner.id,
        businessId: business.id,
        role: "OWNER",
      },
    });

    return { business, owner };
  });
};

const updateTenantInDB = async (id, payload) => {
  const updateData = {};
  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.status !== undefined) updateData.status = payload.status;

  const result = await prisma.business.update({
    where: {
      id,
    },
    data: updateData,
  });

  return result;
};

const deleteTenantFromDB = async (id) => {
  // 1. Fetch business to get ownerId
  const business = await prisma.business.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!business) {
    throw new DevBuildError("Tenant not found", StatusCodes.NOT_FOUND);
  }

  const ownerId = business.ownerId;

  // 2. Fetch training sessions and calls to get their IDs for sub-deletion
  const trainingSessions = await prisma.trainingSession.findMany({
    where: { businessId: id },
    select: { id: true },
  });
  const sessionIds = trainingSessions.map((s) => s.id);

  const calls = await prisma.call.findMany({
    where: { businessId: id },
    select: { id: true },
  });
  const callIds = calls.map((c) => c.id);

  // 3. Perform transactional deletion
  console.log(`🗑️ Deleting tenant ${id} and owner ${ownerId}`);
  return await prisma.$transaction(async (tx) => {
    // Delete files in sessions
    if (sessionIds.length > 0) {
      await tx.trainingFile.deleteMany({
        where: { sessionId: { in: sessionIds } },
      });
    }

    // Delete call data
    if (callIds.length > 0) {
      await tx.callSummary.deleteMany({
        where: { callId: { in: callIds } },
      });
    }

    // Delete business-related records
    await tx.trainingSession.deleteMany({ where: { businessId: id } });
    await tx.call.deleteMany({ where: { businessId: id } });
    await tx.invoice.deleteMany({ where: { businessId: id } });
    await tx.subscription.deleteMany({ where: { businessId: id } });
    await tx.apiKey.deleteMany({ where: { businessId: id } });
    await tx.usageLog.deleteMany({ where: { businessId: id } });
    await tx.userBusiness.deleteMany({ where: { businessId: id } });
    await tx.businessSetting.deleteMany({ where: { businessId: id } });
    await tx.integration.deleteMany({ where: { businessId: id } });

    // Delete the business
    await tx.business.delete({
      where: { id },
    });

    // Finally delete the owner
    console.log(`✅ Deleting owner ${ownerId}`);
    return await tx.user.delete({
      where: { id: ownerId },
    });
  });
};

const impersonateTenantInDB = async (tenantId, systemOwnerId) => {
  const business = await prisma.business.findUnique({
    where: { id: tenantId },
    include: {
      owner: true,
    },
  });

  if (!business) {
    throw new DevBuildError("Tenant not found", StatusCodes.NOT_FOUND);
  }

  const owner = business.owner;
  if (!owner) {
    throw new DevBuildError("Tenant owner not found", StatusCodes.NOT_FOUND);
  }

  const tokens = createImpersonationTokens(owner, systemOwnerId);

  return {
    tokens,
    user: {
      id: owner.id,
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email,
      role: owner.role,
    },
    business: {
      id: business.id,
      name: business.name,
    },
  };
};

export const TenantsService = {
  getAllTenantsFromDB,
  createTenantInDB,
  getTenantByIdFromDB,
  updateTenantInDB,
  deleteTenantFromDB,
  impersonateTenantInDB,
};
