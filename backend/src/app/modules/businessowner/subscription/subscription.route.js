import { Router } from "express";
import { SubscriptionController } from "./subscription.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.get(
  "/my-subscription",
  checkAuthMiddleware("BUSINESS_OWNER"),
  SubscriptionController.getMySubscription,
);

router.get(
  "/plans",
  checkAuthMiddleware("BUSINESS_OWNER"),
  SubscriptionController.getAllPlans,
);

router.get(
  "/billing-history",
  checkAuthMiddleware("BUSINESS_OWNER"),
  SubscriptionController.getBillingHistory,
);

export const SubscriptionRouter = router;
