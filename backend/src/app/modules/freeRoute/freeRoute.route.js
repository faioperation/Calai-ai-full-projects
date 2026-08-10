import { Router } from "express";
import { FreeRouteController } from "./freeRoute.controller.js";

const router = Router();

router.get("/plans", FreeRouteController.getPlans);

export const FreeRouter = router;
