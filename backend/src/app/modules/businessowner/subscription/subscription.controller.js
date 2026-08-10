import { StatusCodes } from "http-status-codes";
import { SubscriptionService } from "./subscription.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Subscription Error:", error);
  if (error instanceof DevBuildError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "An internal server error occurred",
  });
};

const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await SubscriptionService.getMySubscriptionFromDB(userId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Current subscription retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAllPlans = async (req, res) => {
  try {
    const result = await SubscriptionService.getAllPlansFromDB();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Plans retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getBillingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await SubscriptionService.getBillingHistoryFromDB(userId);

    // Format the response to exactly match the frontend needs if necessary,
    // but returning the raw invoices with nested plan data is usually best practice

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Billing history retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const SubscriptionController = {
  getMySubscription,
  getAllPlans,
  getBillingHistory,
};
