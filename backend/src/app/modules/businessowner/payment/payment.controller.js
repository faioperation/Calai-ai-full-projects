import { StatusCodes } from "http-status-codes";
import { PaymentService } from "./payment.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleError = (res, error) => {
  console.error("Payment Error:", error);
  if (error instanceof DevBuildError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "An internal server error occurred",
  });
};

const createCheckoutSession = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;

    if (!planId || !billingCycle) {
      throw new DevBuildError(
        "Plan ID and Billing Cycle are required",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (!["monthly", "yearly"].includes(billingCycle)) {
      throw new DevBuildError(
        "Invalid billing cycle. Must be 'monthly' or 'yearly'",
        StatusCodes.BAD_REQUEST,
      );
    }

    const { url } = await PaymentService.createStripeCheckoutSession(
      req.user,
      planId,
      billingCycle,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Checkout session created successfully",
      data: { url },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // We expect req.rawBody to be populated by the verify hook in express.json()
    if (!req.rawBody) {
      throw new Error(
        "Raw body is missing! Please configure express.json verify hook in app.js.",
      );
    }
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Pass the verified event to our service logic
    await PaymentService.processStripeWebhook(event);

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Webhook Processing Error:`, error);
    // Returning 200 even on processing errors so Stripe doesn't repeatedly retry
    // unless we want it to retry. For MVP returning 200 is fine.
    res
      .status(200)
      .json({ received: true, error: "Processing failed but received" });
  }
};

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
};
