import Stripe from "stripe";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";
import { StatusCodes } from "http-status-codes";
import { createAuditLog } from "../../../utils/auditLogger.js";
import { envVars } from "../../../config/env.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createStripeCheckoutSession = async (user, planId, billingCycle) => {
  // Find business for the user
  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  if (!business) {
    throw new DevBuildError(
      "Business not found for this user",
      StatusCodes.NOT_FOUND,
    );
  }

  // Find the plan
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new DevBuildError("Plan not found", StatusCodes.NOT_FOUND);
  }

  // Prevent multiple Free Trial subscriptions
  if (/free tra[il]/i.test(plan.name)) {
    const hasExistingFreeTrial = await prisma.subscription.findFirst({
      where: {
        businessId: business.id,
        plan: {
          name: {
            startsWith: "Free Tra",
          },
        },
      },
    });

    if (hasExistingFreeTrial) {
      throw new DevBuildError(
        "You have already used your Free Trial. Please select a paid plan.",
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  // Determine Stripe Price ID
  const priceId =
    billingCycle === "yearly"
      ? plan.stripeYearlyPriceId
      : plan.stripeMonthlyPriceId;

  if (!priceId) {
    throw new DevBuildError(
      `Stripe price ID for ${billingCycle} is not configured for this plan`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  // Frontend Success/Cancel URLs
  const frontendUrl = envVars.FRONT_END_URL || "http://localhost:3000";
  const successUrl = `${frontendUrl}/owner/settings/subscription`;
  const cancelUrl = `${frontendUrl}/owner/settings/subscription`;

  const lineItems = [
    {
      price: priceId,
      quantity: 1,
    },
  ];

  // Check if business has already purchased a paid plan before
  const hasPreviousPaidPlan = await prisma.subscription.findFirst({
    where: {
      businessId: business.id,
      plan: {
        priceMonthly: { gt: 0 },
      },
    },
  });

  // Add one-time onboarding fee if applicable (only for first-time paid subscribers)
  if (plan.onboardingFee && plan.onboardingFee > 0 && !hasPreviousPaidPlan) {
    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `${plan.name} Plan One-Time Onboarding Fee`,
        },
        unit_amount: Math.round(plan.onboardingFee * 100),
      },
      quantity: 1,
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    client_reference_id: business.id,
    customer_email: user.email,
    line_items: lineItems,
    metadata: {
      businessId: business.id,
      planId: plan.id,
      billingCycle: billingCycle,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { url: session.url };
};

const processStripeWebhook = async (event) => {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const businessId =
      session.metadata?.businessId || session.client_reference_id;
    const planId = session.metadata?.planId;

    // We get billing cycle from metadata, or we can fetch subscription details from stripe
    const billingCycle = session.metadata?.billingCycle || "monthly";

    if (businessId && planId) {
      // Fetch the business and owner details
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { owner: true },
      });

      // Deactivate any existing active subscription
      await prisma.subscription.updateMany({
        where: { businessId, status: "active" },
        data: { status: "canceled" },
      });

      // Calculate end date based on billing cycle
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (billingCycle === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Create new active subscription
      const newSubscription = await prisma.subscription.create({
        data: {
          businessId: businessId,
          planId: planId,
          status: "active",
          startDate: startDate,
          endDate: endDate,
        },
      });

      // Get plan price to record invoice
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      const amount =
        billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

      // Create an invoice record
      await prisma.invoice.create({
        data: {
          businessId: businessId,
          subscriptionId: newSubscription.id,
          invoiceNo: session.invoice || `INV-${Date.now()}`,
          amount: amount,
          status: "paid", // Mark as paid
          billingCycle: billingCycle,
        },
      });

      // Log plan purchase in audit log
      if (business && plan) {
        await createAuditLog({
          userId: business.ownerId,
          userEmail: business.owner?.email,
          action: "PLAN_PURCHASED",
          details: `${business.name} tenant purchased ${plan.name} plan`,
          ipAddress: "Stripe Webhook",
        });
      }
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
  }
};

export const PaymentService = {
  createStripeCheckoutSession,
  processStripeWebhook,
};
