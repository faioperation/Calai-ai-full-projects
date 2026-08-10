import prisma from "../prisma/client.js";
import { createAuditLog } from "./auditLogger.js";

/**
 * Checks for active subscriptions that are past their end date and marks them as expired.
 * Also marks the associated business status as expired and logs the event in the audit trail.
 */
export const checkAndExpireSubscriptions = async () => {
  try {
    const now = new Date();

    // Find all active subscriptions where endDate is less than or equal to now
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        endDate: {
          lte: now,
        },
      },
      include: {
        business: {
          include: {
            owner: true,
          },
        },
        plan: true,
      },
    });

    if (expiredSubscriptions.length === 0) {
      return;
    }

    console.log(
      `⏳ Found ${expiredSubscriptions.length} expired subscription(s). Processing...`,
    );

    for (const sub of expiredSubscriptions) {
      await prisma.$transaction(async (tx) => {
        // Update subscription status to expired
        await tx.subscription.update({
          where: { id: sub.id },
          data: { status: "expired" },
        });

        // Update the business status to expired
        await tx.business.update({
          where: { id: sub.businessId },
          data: { status: "expired" },
        });

        // Log to audit log in exact requested format: "xyz tenants abc plan expired"
        await createAuditLog(
          {
            userId: sub.business.ownerId,
            userEmail: sub.business.owner?.email,
            action: "SUBSCRIPTION_EXPIRED",
            details: `${sub.business.name} tenants ${sub.plan.name} plan expired`,
            ipAddress: "System Scheduler",
          },
          tx,
        );
      });

      console.log(
        `✅ Subscription ${sub.id} for tenant "${sub.business.name}" has been marked as expired.`,
      );
    }
  } catch (error) {
    console.error("Error in checkAndExpireSubscriptions scheduler:", error);
  }
};
