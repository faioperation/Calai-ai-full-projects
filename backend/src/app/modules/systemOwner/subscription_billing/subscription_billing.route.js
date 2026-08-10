import { Router } from "express";
import { SubscriptionBillingController } from "./subscription_billing.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
  "/plans",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  SubscriptionBillingController.getAllPlans,
);

router.get(
  "/billings",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  SubscriptionBillingController.getDashboardData,
);

export const SubscriptionBillingRouter = router;
