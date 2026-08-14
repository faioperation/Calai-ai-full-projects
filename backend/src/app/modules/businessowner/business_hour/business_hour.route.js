import { Router } from "express";
import { BusinessHourController } from "./business_hour.controller.js";
import { BusinessHourValidation } from "./business_hour.validation.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import validateRequest from "../../../middleware/validateRequest.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware("BUSINESS_OWNER"),
  BusinessHourController.getBusinessHour,
);

router.patch(
  "/",
  checkAuthMiddleware("BUSINESS_OWNER"),
  validateRequest(BusinessHourValidation.updateBusinessHourSchema),
  BusinessHourController.updateBusinessHour,
);

export const BusinessHourRouter = router;
