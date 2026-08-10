import { Router } from "express";
import { PaymentController } from "./payment.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.post(
  "/create-checkout-session",
  checkAuthMiddleware("BUSINESS_OWNER"),
  PaymentController.createCheckoutSession,
);

router.post("/webhook", PaymentController.handleWebhook);

export const PaymentRouter = router;
