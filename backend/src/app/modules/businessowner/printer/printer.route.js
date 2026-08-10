import { Router } from "express";
import { PrinterController } from "./printer.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";

// Dashboard CRUD endpoints for the Business Owner
const router = Router();

router.get(
  "/",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  PrinterController.getPrinters,
);

router.get(
  "/download-bridge",
  PrinterController.downloadPrintBridge,
);

router.get(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  PrinterController.getPrinterById,
);

router.post(
  "/",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  PrinterController.createPrinter,
);

router.patch(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  PrinterController.updatePrinter,
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  PrinterController.deletePrinter,
);

router.post(
  "/:id/print-order",
  checkAuthMiddleware(Role.BUSINESS_OWNER),
  PrinterController.queueOrderPrint,
);

export const PrinterRouter = router;
