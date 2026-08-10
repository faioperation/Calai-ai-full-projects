import { Router } from "express";
import { AIAgentController } from "./ai-training.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware("BUSINESS_OWNER"),
  AIAgentController.getAgents,
);

export const AIAgentRouter = router;
