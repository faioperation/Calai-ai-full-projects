import { StatusCodes } from "http-status-codes";
import { TelephonyService } from "./telephony.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Telephony Error:", error);
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

const getAllTelephony = async (req, res) => {
  try {
    const result = await TelephonyService.getAllTelephonyFromDB();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Telephony configurations fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getTelephonyById = async (req, res) => {
  try {
    const result = await TelephonyService.getTelephonyByIdFromDB(req.params.id);

    if (!result) {
      throw new DevBuildError(
        "Telephony configuration not found",
        StatusCodes.NOT_FOUND,
      );
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Telephony configuration fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const createTelephony = async (req, res) => {
  try {
    const result = await TelephonyService.createTelephonyInDB(req.body);

    if (!result) {
      throw new DevBuildError(
        "Agent not found with the provided assistant_id and businessId",
        StatusCodes.NOT_FOUND,
      );
    }

    if (result === "ALREADY_EXISTS") {
      throw new DevBuildError(
        "Telephony number configuration already exists for this agent",
        StatusCodes.CONFLICT,
      );
    }

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Telephony configuration created successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateTelephony = async (req, res) => {
  try {
    const existing = await TelephonyService.getTelephonyByIdFromDB(
      req.params.id,
    );
    if (!existing) {
      throw new DevBuildError(
        "Telephony configuration not found",
        StatusCodes.NOT_FOUND,
      );
    }

    const result = await TelephonyService.updateTelephonyInDB(
      req.params.id,
      req.body,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Telephony configuration updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteTelephony = async (req, res) => {
  try {
    const existing = await TelephonyService.getTelephonyByIdFromDB(
      req.params.id,
    );
    if (!existing) {
      throw new DevBuildError(
        "Telephony configuration not found",
        StatusCodes.NOT_FOUND,
      );
    }

    const result = await TelephonyService.deleteTelephonyFromDB(req.params.id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Telephony configuration deleted successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getUnconfiguredAgents = async (req, res) => {
  try {
    const { businessId } = req.params;
    const result = await TelephonyService.getUnconfiguredAgentsByBusinessIdFromDB(businessId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Unconfigured agents fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const TelephonyController = {
  getAllTelephony,
  getTelephonyById,
  createTelephony,
  updateTelephony,
  deleteTelephony,
  getUnconfiguredAgents,
};
