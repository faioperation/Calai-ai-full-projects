import express from "express";
import { WebhookController } from "./webhook.controller.js";

const router = express.Router();

// Vapi Webhook Endpoint
router.post("/vapi", WebhookController.handleVapiWebhook);

export const WebhookRouter = router;
