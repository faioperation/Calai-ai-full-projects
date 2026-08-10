import { StatusCodes } from "http-status-codes";
import { BusinessHourService } from "./business_hour.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error, context = "Business Hour Management") => {
  console.error(`${context} Error:`, error);
  if (error instanceof DevBuildError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || "An internal server error occurred",
  });
};

const getBusinessHour = async (req, res) => {
  try {
    const { businessId } = req.params;
    const result = await BusinessHourService.getBusinessHourByBusinessId(
      businessId,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Business hours fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Get Business Hour");
  }
};

const updateBusinessHour = async (req, res) => {
  try {
    const { businessId } = req.params;
    const result = await BusinessHourService.updateBusinessHour(
      businessId,
      req.body,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Business hours updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Update Business Hour");
  }
};

export const BusinessHourController = {
  getBusinessHour,
  updateBusinessHour,
};
