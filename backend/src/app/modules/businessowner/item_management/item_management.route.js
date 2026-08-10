import { Router } from "express";
import { ItemManagementController } from "./item_management.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";
import { upload } from "../../../utils/fileUpload.js";

const router = Router();

// Guard all endpoints under this module to BUSINESS_OWNER role
router.use(checkAuthMiddleware("BUSINESS_OWNER"));

router.get("/", ItemManagementController.getItems);

router.post("/", ItemManagementController.createItem);

router.patch(
  "/update-menu",
  (req, res, next) => {
    req.uploadPath = "uploads/menu/";
    next();
  },
  upload.single("menu_file"),
  ItemManagementController.updateMenuFile,
);

router.patch("/:id", ItemManagementController.updateItem);
router.delete("/:id", ItemManagementController.deleteItem);

export const ItemManagementRouter = router;
