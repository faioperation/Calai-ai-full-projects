import { WebhookService } from "./webhook.service.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

/**
 * Handle Vapi Webhook
 */
const handleVapiWebhook = async (req, res, next) => {
  try {
    const payload = req.body;

    const result = await WebhookService.processVapiWebhook(payload);

    if (result && result.isAssistantRequestResponse) {
      const { isAssistantRequestResponse, ...responseBody } = result;
      return res.status(StatusCodes.OK).json(responseBody);
    }

    if (result && result.isToolCallResponse) {
      return res.status(StatusCodes.OK).json({
        results: result.results,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Webhook processed",
      data: result,
    });
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    // Still return 200 to Vapi to prevent retries if it's a processing error
    // but log it on our side.
    res.status(StatusCodes.OK).json({
      success: false,
      error: error.message,
    });
  }
};

export const WebhookController = {
  handleVapiWebhook,
};
