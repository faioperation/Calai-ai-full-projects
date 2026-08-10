import { Router } from "express";
import { SettingsController } from "./settings.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { Role } from "../../../utils/role.js";
import { upload } from "../../../utils/fileUpload.js";

const router = Router();

// Middleware to set upload path for logo
const setLogoUploadPath = (req, res, next) => {
  req.uploadPath = "uploads/platform/";
  next();
};

router.get(
  "/logo",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  SettingsController.getLogo,
);

router.patch(
  "/logo",
  checkAuthMiddleware(Role.SYSTEM_OWNER),
  setLogoUploadPath,
  upload.single("logo"),
  SettingsController.updateLogo,
);

export const SettingsRouter = router;
