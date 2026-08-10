import { Router } from "express";
import { PrinterController } from "./printer.controller.js";

const router = Router();

router.post("/poll", PrinterController.handlePrinterPoll);

router.get("/poll", PrinterController.handlePrinterGetJob);

router.delete("/poll", PrinterController.handlePrinterConfirmJob);

export const DevicePrinterRouter = router;
