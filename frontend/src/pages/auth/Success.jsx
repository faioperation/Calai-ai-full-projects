import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

const Success = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-10">
        {/* Large Checkmark Icon */}
        <div className="bg-linear-to-b from-blue-500 to-blue-700 p-6 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.6)] border-4 border-[#02060F]">
          <Icon icon="lucide:check" width="60" className="text-white" />
        </div>
        {/* Subtle Ring Glow */}
        <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-xl animate-pulse z-0"></div>
      </div>

      <h1 className="text-[32px] text-white font-semibold mb-3">Success!</h1>
      <p className="text-gray-400 text-[13px] mb-8 text-center leading-relaxed max-w-md">
        Your password has been reset successfully. You can now log in with your
        credentials.
      </p>

      <Link to="/auth/login" className="w-full">
        <button className="w-full mt-4 bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white text-sm font-medium py-3.5 rounded-full border border-[#1D4ED8] shadow-[0_0_20px_rgba(29,78,216,0.25)] hover:shadow-[0_0_25px_rgba(29,78,216,0.4)] transition-all">
          Log In
        </button>
      </Link>
    </div>
  );
};

export default Success;
