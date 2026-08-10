import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";

const OTP = () => {
  const inputs = useRef([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const location = useLocation();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const email = location.state?.email || "";

  const verifyOtpMutation = useMutation({
    mutationFn: async (otpData) => {
      const response = await axiosPublic.post(
        "/auth/verify-forgot-password-otp",
        otpData,
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data?.message || "OTP verified successfully!");
        navigate("/auth/new/password", { state: { email, otp: otp.join("") } });
      } else {
        toast.error(data?.message || "Verification failed");
      }
    },
    onError: (error) => {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred during verification";
      toast.error(errorMsg);
    },
  });

  const handleChange = (event, index) => {
    const { value } = event.target;

    // Allow only numbers
    if (!/^\d*$/.test(value)) return;

    // Update current index
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto move to next field
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    // Handle backspace
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return; // Allow only numbers

    const digits = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];

    for (let i = 0; i < 6; i++) {
      if (digits[i] !== undefined) {
        newOtp[i] = digits[i];
      }
    }
    setOtp(newOtp);

    // Focus the appropriate input
    const focusIndex = Math.min(digits.length - 1, 5);
    inputs.current[focusIndex]?.focus();
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }
    verifyOtpMutation.mutate({ email, otp: otpCode });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-[32px] text-white font-semibold mb-2">
        Enter OTP Code
      </h1>
      <p className="text-gray-400 text-[13px] mb-8 text-center">
        Your verification code is on its way to{" "}
        <span className="text-[#2563EB] font-medium">
          {email || "your email"}
        </span>
        ! Check your inbox and enter the code below to reset your password.
      </p>

      <form
        onSubmit={handleConfirm}
        className="w-full flex flex-col items-center"
      >
        <div className="flex gap-4 justify-center mb-10">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              ref={(el) => (inputs.current[i] = el)}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              value={otp[i]}
              className="w-[47px] h-[49px] bg-[#141624] rounded-2xl text-center text-xl font-bold text-[#ffffff] outline-none border border-transparent focus:border-[#2563EB]/50"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={verifyOtpMutation.isPending}
          className="w-full mt-2 bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white text-sm font-medium py-3.5 rounded-full border border-[#1D4ED8] shadow-[0_0_20px_rgba(29,78,216,0.25)] hover:shadow-[0_0_25px_rgba(29,78,216,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifyOtpMutation.isPending ? (
            <>
              <Icon
                icon="lucide:loader-2"
                className="animate-spin"
                width="18"
              />
              Verifying...
            </>
          ) : (
            "Confirm"
          )}
        </button>
      </form>

      <div className="mt-4 text-[12px] text-gray-400">
        You can resend the code in 56 Seconds?{" "}
        <Link
          to="/auth/forgot/password"
          className="text-[#2563EB] hover:text-blue-400"
        >
          Resend Code
        </Link>
      </div>
    </div>
  );
};

export default OTP;
