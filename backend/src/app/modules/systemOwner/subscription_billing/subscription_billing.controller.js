import { StatusCodes } from "http-status-codes";
import { SubscriptionBillingService } from "./subscription_billing.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Subscription Billing Error:", error);
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

const getAllPlans = async (req, res) => {
  try {
    const result = await SubscriptionBillingService.getAllPlansFromDB();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Plans fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getDashboardData = async (req, res) => {
  try {
    const result =
      await SubscriptionBillingService.getSubscriptionDashboardDataFromDB();
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const SubscriptionBillingController = {
  getAllPlans,
  getDashboardData,
};
