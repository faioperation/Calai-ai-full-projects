import React, { useState } from "react";
import Password from "../../components/Password";
import InputField from "../../components/Inputfield";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (signupData) => {
      const response = await axiosPublic.post("/auth/signup", signupData);
      if (response.data?.success) {
        await axiosPublic.post("/auth/send-otp", { email: signupData.email });
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success(data?.message || "Verification code sent to your email!");
        navigate("/auth/signup/confirm", { state: { email } });
      } else {
        toast.error(data?.message || "Signup failed");
      }
    },
    onError: (error) => {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred during signup";
      toast.error(errorMsg);
    },
  });

  const handleSignup = (e) => {
    e.preventDefault();
    if (
      !firstName ||
      !lastName ||
      !businessName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!agree) {
      toast.error("You must agree to the terms of service and privacy policy");
      return;
    }
    signupMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      business_name: businessName,
      email,
      password,
      confirm_password: confirmPassword,
    });
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-[32px] text-white font-semibold mb-2">
        Create Your Account
      </h1>
      <p className="text-gray-400 text-[13px] mb-8 text-center">
        Boost your business — sign up to automate support with AI.
      </p>

      <form onSubmit={handleSignup} className="w-full flex flex-col gap-5">
        <div className="flex w-full gap-5">
          <InputField
            label="First Name"
            type="text"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            labelClass="!text-[13px] !text-gray-300 !font-medium !ml-1"
            inputClass="!bg-[#111424] !text-white !placeholder-gray-600 !rounded-full !py-3.5 !border-transparent focus:!border-[#2563EB]/50 !transition-colors !text-sm"
          />

          <InputField
            label="Last Name"
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            labelClass="!text-[13px] !text-gray-300 !font-medium !ml-1"
            inputClass="!bg-[#111424] !text-white !placeholder-gray-600 !rounded-full !py-3.5 !border-transparent focus:!border-[#2563EB]/50 !transition-colors !text-sm"
          />
        </div>

        <InputField
          label="Organization Name"
          type="text"
          placeholder="Enter organization name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          labelClass="!text-[13px] !text-gray-300 !font-medium !ml-1"
          inputClass="!bg-[#111424] !text-white !placeholder-gray-600 !rounded-full !py-3.5 !border-transparent focus:!border-[#2563EB]/50 !transition-colors !text-sm"
        />

        {/* Email Input */}
        <InputField
          label="Email"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          labelClass="!text-[13px] !text-gray-300 !font-medium !ml-1"
          leftIcon={<Icon icon="lucide:mail" width="18" />}
          inputClass="!bg-[#111424] !text-white !placeholder-gray-600 !rounded-full !py-3.5 !border-transparent focus:!border-[#2563EB]/50 !transition-colors !text-sm"
        />

        {/* Password Input */}
        <Password
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          labelClass="!text-[13px] !text-gray-300 !font-medium !ml-1"
          leftIcon={<Icon icon="lucide:lock" width="18" />}
          inputClass="!bg-[#111424] !text-white !placeholder-gray-600 !rounded-full !py-3.5 !border-transparent focus:!border-[#2563EB]/50 !transition-colors !text-sm"
        />

        <Password
          label="Confirm Password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          labelClass="!text-[13px] !text-gray-300 !font-medium !ml-1"
          leftIcon={<Icon icon="lucide:lock" width="18" />}
          inputClass="!bg-[#111424] !text-white !placeholder-gray-600 !rounded-full !py-3.5 !border-transparent focus:!border-[#2563EB]/50 !transition-colors !text-sm"
        />

        {/* Remember & Forgot Password */}
        <div className="flex items-center justify-between mt-1 px-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#2563EB] bg-[#111424] border-gray-700 rounded cursor-pointer"
            />
            <span className="text-[12px] text-gray-400">
              I agreeing to the terms of service and privacy policy
            </span>
          </label>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full mt-2 bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white text-sm font-medium py-3.5 rounded-full border border-[#1D4ED8] shadow-[0_0_20px_rgba(29,78,216,0.25)] hover:shadow-[0_0_25px_rgba(29,78,216,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {signupMutation.isPending ? (
            <>
              <Icon
                icon="lucide:loader-2"
                className="animate-spin"
                width="18"
              />
              Signing up...
            </>
          ) : (
            "Sign up"
          )}
        </button>
      </form>
      <div className="mt-4 text-[12px] text-gray-400">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-[#2563EB] hover:text-blue-400">
          Log In
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
