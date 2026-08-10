import { Router } from "express";
import { TenantsController } from "./tenants.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { TenantsValidation } from "./tenants.validation.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  TenantsController.getAllTenants,
);

router.post(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(TenantsValidation.createTenantSchema),
  TenantsController.createTenant,
);

router.get(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  TenantsController.getTenantById,
);

router.patch(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(TenantsValidation.updateTenantSchema),
  TenantsController.updateTenant,
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  TenantsController.deleteTenant,
);

router.post(
  "/:id/impersonate",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  TenantsController.impersonateTenant,
);

export const TenantsRouter = router;
