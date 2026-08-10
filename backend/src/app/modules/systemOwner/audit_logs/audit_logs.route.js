import { Router } from "express";
import { AuditLogsController } from "./audit_logs.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { AuditLogsValidation } from "./audit_logs.validation.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(AuditLogsValidation.queryLogsSchema),
  AuditLogsController.getAllAuditLogs,
);

router.get(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(AuditLogsValidation.getOrDeleteLogSchema),
  AuditLogsController.getAuditLogById,
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(AuditLogsValidation.getOrDeleteLogSchema),
  AuditLogsController.deleteAuditLog,
);

router.delete(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  AuditLogsController.deleteAllAuditLogs,
);

export const AuditLogsRouter = router;
