import { Router } from "express";
import { BusinessHourController } from "./business_hour.controller.js";
import { BusinessHourValidation } from "./business_hour.validation.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.get(
  "/:businessId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  BusinessHourController.getBusinessHour,
);

router.patch(
  "/:businessId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(BusinessHourValidation.updateBusinessHourSchema),
  BusinessHourController.updateBusinessHour,
);

export const BusinessHourRouter = router;
