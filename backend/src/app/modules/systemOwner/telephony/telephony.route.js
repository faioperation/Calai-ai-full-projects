import { Router } from "express";
import { TelephonyController } from "./telephony.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { TelephonyValidation } from "./telephony.validation.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  TelephonyController.getAllTelephony,
);

router.post(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(TelephonyValidation.createTelephonySchema),
  TelephonyController.createTelephony,
);

router.get(
  "/unconnected-agents/:businessId",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(TelephonyValidation.getUnconfiguredAgentsSchema),
  TelephonyController.getUnconfiguredAgents,
);

router.get(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(TelephonyValidation.getOrDeleteTelephonySchema),
  TelephonyController.getTelephonyById,
);

router.patch(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(TelephonyValidation.updateTelephonySchema),
  TelephonyController.updateTelephony,
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(TelephonyValidation.getOrDeleteTelephonySchema),
  TelephonyController.deleteTelephony,
);

export const TelephonyRouter = router;
