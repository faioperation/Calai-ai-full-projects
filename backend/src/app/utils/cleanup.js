import prisma from "../prisma/client.js";

export const runDatabaseCleanup = async (retentionDays = 30) => {
  console.log(`🧹 Database Cleanup Job Started (Retention: ${retentionDays} days)`);
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // 1. Find Calls older than cutoffDate
    const oldCalls = await prisma.call.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
      },
    });

    const callIds = oldCalls.map((c) => c.id);

    // 2. Find Orders older than cutoffDate
    const oldOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
      },
    });

    const orderIds = oldOrders.map((o) => o.id);

    if (callIds.length === 0 && orderIds.length === 0) {
      console.log("🧹 Database Cleanup: No old records found to clean up.");
      return { deletedCallsCount: 0, deletedOrdersCount: 0 };
    }

    console.log(`` + 
      `🧹 Database Cleanup: Found ${callIds.length} calls and ${orderIds.length} orders older than ${retentionDays} days.`
    );

    // Perform deletions in correct order in a transaction to prevent constraint violations
    const result = await prisma.$transaction(async (tx) => {
      let deletedPrintJobs = 0;
      let deletedOrderItems = 0;
      let deletedOrders = 0;
      let deletedCallSummaries = 0;
      let deletedCalls = 0;

      if (orderIds.length > 0) {
        // A. Delete PrintJobs
        const printJobDel = await tx.printJob.deleteMany({
          where: {
            orderId: {
              in: orderIds,
            },
          },
        });
        deletedPrintJobs = printJobDel.count;

        // B. Delete OrderItems
        const orderItemDel = await tx.orderItem.deleteMany({
          where: {
            orderId: {
              in: orderIds,
            },
          },
        });
        deletedOrderItems = orderItemDel.count;

        // C. Delete Orders
        const orderDel = await tx.order.deleteMany({
          where: {
            id: {
              in: orderIds,
            },
          },
        });
        deletedOrders = orderDel.count;
      }

      if (callIds.length > 0) {
        // D. Delete CallSummaries
        const summaryDel = await tx.callSummary.deleteMany({
          where: {
            callId: {
              in: callIds,
            },
          },
        });
        deletedCallSummaries = summaryDel.count;

        // E. Delete Calls
        const callDel = await tx.call.deleteMany({
          where: {
            id: {
              in: callIds,
            },
          },
        });
        deletedCalls = callDel.count;
      }

      return {
        deletedPrintJobs,
        deletedOrderItems,
        deletedOrders,
        deletedCallSummaries,
        deletedCalls,
      };
    });

    console.log(`🧹 Database Cleanup Completed Successfully!`);
    console.log(`   - Deleted Print Jobs: ${result.deletedPrintJobs}`);
    console.log(`   - Deleted Order Items: ${result.deletedOrderItems}`);
    console.log(`   - Deleted Orders: ${result.deletedOrders}`);
    console.log(`   - Deleted Call Summaries: ${result.deletedCallSummaries}`);
    console.log(`   - Deleted Calls: ${result.deletedCalls}`);

    return result;
  } catch (error) {
    console.error("❌ Database Cleanup Job Failed:", error);
    throw error;
  }
};
