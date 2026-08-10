import { Router } from "express";
import { AIAgentController } from "./ai-training.controller.js";
import { AIAgentValidation } from "./ai-training.validation.js";
import validateRequest from "../../../middleware/validateRequest.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { upload } from "../../../utils/fileUpload.js";
import { Role } from "../../../utils/role.js";

const router = Router();

router.post(
  "/create",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  (req, res, next) => {
    req.uploadPath = "uploads/training/";
    next();
  },
  upload.fields([
    { name: "rules_file", maxCount: 1 },
    { name: "menu_file", maxCount: 1 },
  ]),
  validateRequest(AIAgentValidation.createAgentValidationSchema),
  AIAgentController.createAgent,
);

router.get(
  "/",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  AIAgentController.getAgents,
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  AIAgentController.deleteAgent,
);

router.patch(
  "/:id/special-offers",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  validateRequest(AIAgentValidation.updateSpecialOffersValidationSchema),
  AIAgentController.updateSpecialOffers,
);

router.post(
  "/upload-special-offers",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  (req, res, next) => {
    req.uploadPath = "uploads/training/";
    next();
  },
  upload.fields([{ name: "special_offers_file", maxCount: 1 }]),
  AIAgentController.uploadSpecialOffers,
);

export const AIAgentRouter = router;
