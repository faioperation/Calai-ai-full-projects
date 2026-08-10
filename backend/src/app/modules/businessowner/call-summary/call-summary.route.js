import { Router } from "express";
import { CallSummaryController } from "./call-summary.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware("BUSINESS_OWNER"),
  CallSummaryController.getCallSummaries,
);

router.get(
  "/summary/:id",
  checkAuthMiddleware("BUSINESS_OWNER"),
  CallSummaryController.getCallSummaryById,
);

router.get(
  "/transcript/:id",
  checkAuthMiddleware("BUSINESS_OWNER"),
  CallSummaryController.getCallTranscriptById,
);

router.get(
  "/download/:id",
  checkAuthMiddleware("BUSINESS_OWNER"),
  CallSummaryController.downloadCallSummaryPdf,
);

export const CallSummaryRouter = router;
