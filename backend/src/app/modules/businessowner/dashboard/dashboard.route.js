import express from "express";
import { DashboardController } from "./dashboard.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = express.Router();

router.get(
  "/stats",
  checkAuthMiddleware("BUSINESS_OWNER"),
  DashboardController.getStats,
);

export const DashboardRouter = router;
