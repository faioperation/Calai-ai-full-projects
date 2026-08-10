import prisma from "../../../prisma/client.js";
import { startOfDay, endOfDay, subDays, addDays } from "date-fns";

const calculateChange = (current, previous) => {
  if (previous === 0) return current > 0 ? "+100.00%" : "0.00%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
};

const getDashboardStatsFromDB = async () => {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const sixtyDaysAgo = subDays(now, 60);
  const thirtyDaysFromNow = addDays(now, 30);

  // --- Total Tenants ---
  const totalTenantsVal = await prisma.business.count();
  const newTenantsThisPeriod = await prisma.business.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
  const newTenantsPrevPeriod = await prisma.business.count({
    where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
  });
  const tenantsChange = calculateChange(
    newTenantsThisPeriod,
    newTenantsPrevPeriod,
  );
  const tenantsSubtext = `${newTenantsThisPeriod >= newTenantsPrevPeriod ? "+" : ""}${newTenantsThisPeriod - newTenantsPrevPeriod} last month`;

  // --- Active Subscriptions ---
  const activeSubsVal = await prisma.subscription.count({
    where: { status: "active" },
  });
  const newSubsThisPeriod = await prisma.subscription.count({
    where: { status: "active", createdAt: { gte: thirtyDaysAgo } },
  });
  const newSubsPrevPeriod = await prisma.subscription.count({
    where: {
      status: "active",
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
  });
  const subsChange = calculateChange(newSubsThisPeriod, newSubsPrevPeriod);
  const subsSubtext = `${newSubsThisPeriod >= newSubsPrevPeriod ? "+" : ""}${newSubsThisPeriod - newSubsPrevPeriod} last month`;

  // --- Monthly Revenue ---
  const revenueSumThisPeriod = await prisma.invoice.aggregate({
    where: {
      status: "paid",
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: {
      amount: true,
    },
  });
  const revenueSumPrevPeriod = await prisma.invoice.aggregate({
    where: {
      status: "paid",
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
    _sum: {
      amount: true,
    },
  });
  const revThisVal = revenueSumThisPeriod._sum.amount || 0;
  const revPrevVal = revenueSumPrevPeriod._sum.amount || 0;
  const revChange = calculateChange(revThisVal, revPrevVal);
  const revSubtext = `${revThisVal >= revPrevVal ? "+" : ""}${revThisVal - revPrevVal >= 0 ? "$" : "-$"}${Math.abs(revThisVal - revPrevVal).toFixed(0)} last month`;

  // --- Expiring Tenants ---
  const expiringVal = await prisma.subscription.count({
    where: {
      status: "active",
      endDate: { gte: now, lte: thirtyDaysFromNow },
    },
  });
  const expiredThisPeriod = await prisma.subscription.count({
    where: {
      status: "expired",
      endDate: { gte: thirtyDaysAgo, lte: now },
    },
  });
  const expiredPrevPeriod = await prisma.subscription.count({
    where: {
      status: "expired",
      endDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
  });
  const expiringChange = calculateChange(expiredThisPeriod, expiredPrevPeriod);
  const expiringSubtext = `${expiredThisPeriod >= expiredPrevPeriod ? "+" : ""}${expiredThisPeriod - expiredPrevPeriod} last month`;

  // --- Sparkline Data Generation (Last 7 Days) ---
  const sparklineDays = 7;
  const totalTenantsSparkline = [];
  const activeSubscriptionsSparkline = [];
  const monthlyRevenueSparkline = [];
  const expiringTenantsSparkline = [];

  for (let i = sparklineDays - 1; i >= 0; i--) {
    const date = subDays(now, i);
    const start = startOfDay(date);
    const end = endOfDay(date);

    const tenantsCount = await prisma.business.count({
      where: { createdAt: { gte: start, lte: end } },
    });
    totalTenantsSparkline.push(tenantsCount);

    const subsCount = await prisma.subscription.count({
      where: {
        status: "active",
        createdAt: { gte: start, lte: end },
      },
    });
    activeSubscriptionsSparkline.push(subsCount);

    const revSum = await prisma.invoice.aggregate({
      where: {
        status: "paid",
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    monthlyRevenueSparkline.push(revSum._sum.amount || 0);

    const expiringCount = await prisma.subscription.count({
      where: {
        status: "active",
        endDate: { gte: start, lte: end },
      },
    });
    expiringTenantsSparkline.push(expiringCount);
  }

  // --- Plan Distribution ---
  const plans = await prisma.plan.findMany();
  const planDistribution = await Promise.all(
    plans.map(async (p) => {
      const count = await prisma.subscription.count({
        where: { planId: p.id, status: "active" },
      });
      const percentage =
        activeSubsVal > 0 ? Math.round((count / activeSubsVal) * 100) : 0;
      return {
        name: p.name,
        count,
        percentage,
      };
    }),
  );

  // --- Tenant Status Distribution ---
  const statuses = ["active", "suspended", "trial", "expired"];
  const tenantStatusDistribution = await Promise.all(
    statuses.map(async (status) => {
      const count = await prisma.business.count({ where: { status } });
      const percentage =
        totalTenantsVal > 0 ? Math.round((count / totalTenantsVal) * 100) : 0;
      return {
        status,
        count,
        percentage,
      };
    }),
  );

  return {
    stats: {
      totalTenants: {
        value: totalTenantsVal,
        change: tenantsChange,
        subtext: tenantsSubtext,
        sparkline: totalTenantsSparkline,
      },
      activeSubscriptions: {
        value: activeSubsVal,
        change: subsChange,
        subtext: subsSubtext,
        sparkline: activeSubscriptionsSparkline,
      },
      monthlyRevenue: {
        value: revThisVal,
        change: revChange,
        subtext: revSubtext,
        sparkline: monthlyRevenueSparkline,
      },
      expiringTenants: {
        value: expiringVal,
        change: expiringChange,
        subtext: expiringSubtext,
        sparkline: expiringTenantsSparkline,
      },
    },
    planDistribution,
    tenantStatusDistribution,
  };
};

export const DashboardService = {
  getDashboardStatsFromDB,
};
