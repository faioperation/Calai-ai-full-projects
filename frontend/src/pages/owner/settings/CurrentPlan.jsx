import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { Loader2 } from "lucide-react";

const CurrentPlan = () => {
  const axiosSecure = useAxiosSecure();

  const { data: subResponse, isLoading } = useQuery({
    queryKey: ["mySubscription"],
    queryFn: async () => {
      const response = await axiosSecure.get(
        "/business-owner/subscription/my-subscription",
      );
      return response.data;
    },
  });

  const sub = subResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100px] mt-6 mb-12">
        <Loader2 className="animate-spin text-[#2563EB] w-8 h-8" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="relative bg-[#0E0E10] border border-[#272727] rounded-2xl p-6 mt-6 mb-12 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">You do not have an active subscription.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative bg-[#0E0E10] border border-[#272727] rounded-2xl p-6 mt-6 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      {/* Badge */}
      <div className="absolute -top-3.5 left-6 bg-[#131313] border border-[#272727] px-4 py-1.5 rounded-full text-xs text-gray-300 font-medium">
        Current Plan
      </div>

      {/* Left Content */}
      <div className="flex flex-col gap-2 pt-2 sm:pt-0">
        <div className="flex items-center gap-4 mb-1">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-white tracking-tight leading-none">
            {sub?.plan?.name || "Unknown Plan"}
          </h2>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mt-1 ${sub?.status === "active" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}
          >
            {sub?.status === "active" ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-[15px] text-gray-400 mb-2">
          ${sub?.plan?.priceMonthly}/month
        </p>
        <div className="flex items-center gap-3 text-[14px] text-gray-400 mt-2">
          <span>
            Start Date :{" "}
            {formatDate(
              sub?.currentPeriodStart || sub?.createdAt || sub?.startDate,
            )}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
          <span>
            End Date : {formatDate(sub?.currentPeriodEnd || sub?.endDate)}
          </span>
        </div>
      </div>

      {/* Right Button */}
      <div>
        <button
          disabled={sub?.status === "active"}
          className={`px-8 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            sub?.status === "active"
              ? "border border-[#272727] bg-[#1A1A1A] text-gray-500 cursor-not-allowed"
              : "border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer"
          }`}
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};

export default CurrentPlan;
