import { Router } from "express";
import { IndividualTenantController } from "./individual_tenant.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
  "/:id/agents",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  IndividualTenantController.getTenantAgents,
);

router.get(
  "/:id/calls",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  IndividualTenantController.getTenantCalls,
);

router.get(
  "/:id/orders",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  IndividualTenantController.getTenantOrders,
);

router.get(
  "/:id/billing",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  IndividualTenantController.getTenantBillingHistory,
);

router.get(
  "/download/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  IndividualTenantController.downloadOrderPdf,
);

export const IndividualTenantRouter = router;
