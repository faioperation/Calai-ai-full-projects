import prisma from "../../../prisma/client.js";

const getAllPlansFromDB = async () => {
  const result = await prisma.plan.findMany({
    orderBy: {
      priceMonthly: "asc",
    },
  });
  return result;
};

const getSubscriptionDashboardDataFromDB = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Total Revenue (Paid Invoices)
  const totalRevenueAggregate = await prisma.invoice.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: "paid",
    },
  });

  // 2. This Month Revenue (Paid Invoices)
  const monthlyRevenueAggregate = await prisma.invoice.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: "paid",
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  });

  // 3. Active Plans Count
  const activePlansCount = await prisma.subscription.count({
    where: {
      status: "active",
    },
  });

  // 4. Recent Invoices
  const recentInvoices = await prisma.invoice.findMany({
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      business: {
        select: {
          name: true,
        },
      },
      subscription: {
        include: {
          plan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Format invoices for UI
  const formattedInvoices = recentInvoices.map((invoice) => ({
    invoice_no: invoice.invoiceNo,
    company_name: invoice.business?.name || "N/A",
    plan: invoice.subscription?.plan?.name || "N/A",
    amount: invoice.amount,
    expiry_date: invoice.subscription?.endDate || null,
    status: invoice.status,
    billing_cycle: invoice.billingCycle,
  }));

  return {
    stats: {
      total_revenue: totalRevenueAggregate._sum.amount || 0,
      monthly_revenue: monthlyRevenueAggregate._sum.amount || 0,
      active_plans: activePlansCount,
    },
    recent_invoices: formattedInvoices,
  };
};

export const SubscriptionBillingService = {
  getAllPlansFromDB,
  getSubscriptionDashboardDataFromDB,
};
