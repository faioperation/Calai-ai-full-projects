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

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const normalizedBody = {};
    for (const key in req.body) {
      normalizedBody[key.trim()] = req.body[key];
    }

    const { first_name, last_name } = normalizedBody;
    const updateData = {};

    if (first_name) updateData.firstName = first_name;
    if (last_name) updateData.lastName = last_name;

    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    if (Object.keys(updateData).length === 0) {
      throw new DevBuildError(
        "No data provided to update",
        StatusCodes.BAD_REQUEST,
      );
    }

    const result = await SettingsService.updateProfileInDB(userId, updateData);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await SettingsService.getProfileFromDB(userId);

    if (!result) {
      throw new DevBuildError("User profile not found", StatusCodes.NOT_FOUND);
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getContactInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await SettingsService.getContactInfoFromDB(userId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Contact information retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updatePhone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone } = req.body;

    const result = await SettingsService.updatePhoneInDB(userId, phone);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Phone number updated successfully",
      data: {
        id: result.id,
        phone: result.phone,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getBusinessDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await SettingsService.getBusinessDetailsFromDB(userId);

    if (!result) {
      throw new DevBuildError(
        "Business details not found",
        StatusCodes.NOT_FOUND,
      );
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Business details retrieved successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateBusinessDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const normalizedBody = {};
    for (const key in req.body) {
      normalizedBody[key.trim()] = req.body[key];
    }

    const { name, address, openingTime, closingTime, offDays } = normalizedBody;
    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (openingTime !== undefined) updateData.openingTime = openingTime;
    if (closingTime !== undefined) updateData.closingTime = closingTime;
    if (offDays !== undefined) updateData.offDays = offDays;

    if (Object.keys(updateData).length === 0) {
      throw new DevBuildError(
        "No data provided to update",
        StatusCodes.BAD_REQUEST,
      );
    }

    await SettingsService.updateBusinessDetailsInDB(userId, updateData);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Business details updated successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const SettingsController = {
  updateProfile,
  getProfile,
  getContactInfo,
  updatePhone,
  getBusinessDetails,
  updateBusinessDetails,
};
