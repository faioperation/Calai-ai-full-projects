import { StatusCodes } from "http-status-codes";
import { SettingsService } from "./settings.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Settings Error:", error);
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

const updateLogo = async (req, res) => {
  try {
    if (!req.file) {
      throw new DevBuildError("Logo file is required", StatusCodes.BAD_REQUEST);
    }

    // Since we're storing locally, we'll store the relative path
    const logoUrl = `/${req.file.path.replace(/\\/g, "/")}`;

    const result = await SettingsService.updatePlatformLogoInDB(logoUrl);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Platform logo updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getLogo = async (req, res) => {
  try {
    const result = await SettingsService.getPlatformLogoFromDB();
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Platform logo fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const SettingsController = {
  updateLogo,
  getLogo,
};
