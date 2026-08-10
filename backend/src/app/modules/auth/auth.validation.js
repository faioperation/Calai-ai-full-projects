import { z } from "zod";

const signupSchema = z.object({
  body: z
    .object({
      first_name: z.string({ required_error: "First name is required" }),
      last_name: z.string({ required_error: "Last name is required" }),
      business_name: z.string({ required_error: "Business name is required" }),
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address"),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
      confirm_password: z.string({
        required_error: "Confirm password is required",
      }),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"],
    }),
});

const sendOtpSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address"),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address"),
    otp: z.string({ required_error: "OTP is required" }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address"),
    password: z.string({ required_error: "Password is required" }),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address"),
  }),
});

const verifyForgotPasswordOtpSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email address"),
    otp: z.string({ required_error: "OTP is required" }),
  }),
});

const resetPasswordSchema = z.object({
  body: z
    .object({
      newPassword: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string({
        required_error: "Confirm password is required",
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string({
        required_error: "Current password is required",
      }),
      newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string({
        required_error: "Confirm password is required",
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

export const AuthValidation = {
  signupSchema,
  sendOtpSchema,
  verifyOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyForgotPasswordOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
