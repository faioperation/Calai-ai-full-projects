import { Router } from "express";
import { OrderController } from "./order.controller.js";
import { checkAuthMiddleware } from "../../../middleware/checkAuthMiddleware.js";

const router = Router();

router.get(
  "/",
  checkAuthMiddleware("BUSINESS_OWNER"),
  OrderController.getOrders,
);

router.get(
  "/:id",
  checkAuthMiddleware("BUSINESS_OWNER"),
  OrderController.getOrderById,
);

router.get(
  "/download/:id",
  checkAuthMiddleware("BUSINESS_OWNER"),
  OrderController.downloadOrderPdf,
);

export const OrderRouter = router;
