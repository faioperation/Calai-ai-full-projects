import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service.js";
import { OtpService } from "../otp/otp.service.js";
import prisma from "../../prisma/client.js";
import DevBuildError from "../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Auth Error:", error);
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

const signup = async (req, res) => {
  try {
    const { user } = await AuthService.signup(prisma, req.body);

    // Automatically send OTP after signup
    await OtpService.sendOtp(
      prisma,
      user.email,
      `${user.firstName} ${user.lastName}`,
    );

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        },
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    await OtpService.sendOtp(prisma, email);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    await OtpService.verifyOtp(prisma, email, otp);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const result = await AuthService.login(prisma, req.body);
    const { refreshToken, accessToken, user } = result;

    // Store refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data: { user, accessToken },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const result = await AuthService.refreshAccessToken(prisma, refreshToken);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Access token refreshed successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    await AuthService.sendForgotPasswordOtp(prisma, email);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "OTP sent to your email. It expires in 2 minutes.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const resetToken = await AuthService.verifyForgotPasswordOtp(
      prisma,
      email,
      otp,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "OTP verified. Use the reset token to set a new password.",
      data: { resetToken },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    // Extract raw token (already verified by checkAuthMiddleware)
    const resetToken = req.headers.authorization.replace(/^Bearer\s*/i, "");
    await AuthService.resetPassword(
      prisma,
      req.user.id,
      resetToken,
      newPassword,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(
      prisma,
      req.user.id,
      currentPassword,
      newPassword,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const AuthController = {
  signup,
  sendOtp,
  verifyOtp,
  login,
  refreshAccessToken,
  logout,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  changePassword,
};
