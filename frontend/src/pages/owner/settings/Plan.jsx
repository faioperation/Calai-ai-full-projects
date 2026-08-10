import React, { useState } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import EnterpriseContactModal from "../../../components/EnterpriseContactModal";

const PlanCard = ({ plan, onUpgrade, isPendingUpgrade, isCurrentPlan }) => {
  const isPopular = plan.name?.toLowerCase() === "starter" || plan.isPopular;

  return (
    <div
      className={`bg-[#0E0E10] border ${isPopular ? "border-blue-600/30 shadow-[0_0_20px_rgba(37,99,235,0.05)]" : "border-[#272727]"} p-6 rounded-[28px] flex flex-col gap-6 hover:border-[#333333] transition-all group h-full`}
    >
      <div className="flex flex-col gap-5">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium w-fit transition-colors ${isPopular ? "bg-blue-600/10 text-blue-400 border border-blue-600/40" : "bg-[#1A1A1A] text-gray-300 border border-[#272727]"}`}
        >
          {plan.name}
          <Sparkles
            className={`w-3.5 h-3.5 ${isPopular ? "text-blue-400" : "text-gray-400"}`}
          />
        </div>

        <div className="flex items-baseline gap-1.5">
          {plan.name?.toLowerCase() === "enterprise" ? (
            <span className="text-white text-[24px] font-bold tracking-tight">
              Custom Price
            </span>
          ) : (
            <>
              <span className="text-white text-[32px] font-bold tracking-tight">
                £{plan.priceMonthly}
              </span>
              <span className="text-gray-500 text-sm font-medium">/month</span>
            </>
          )}
        </div>

        <p className="text-gray-400 text-[13px] leading-relaxed min-h-[40px]">
          {plan.callLimit > 0
            ? `${plan.callLimit} minutes total usage`
            : "AI Smarter Support"}
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-2 mb-6">
        {plan.features?.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Check className="w-4 h-4 text-blue-500/80" />
            <span className="text-[13px] text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full py-2.5 rounded-lg border border-[#272727] bg-[#1A1A1A] text-sm text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
          >
            Current Plan
          </button>
        ) : (
          <button
            onClick={() => onUpgrade(plan)}
            disabled={isPendingUpgrade}
            className="w-full py-2.5 rounded-lg border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPendingUpgrade && <Loader2 className="w-4 h-4 animate-spin" />}
            {plan.name?.toLowerCase() === "enterprise"
              ? "Contact Us"
              : "Upgrade plan"}
          </button>
        )}
      </div>
    </div>
  );
};

const Plan = () => {
  const axiosSecure = useAxiosSecure();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { data: plansResponse, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      const response = await axiosSecure.get(
        "/business-owner/subscription/plans",
      );
      return response.data;
    },
  });

  const { data: subResponse, isLoading: isLoadingSub } = useQuery({
    queryKey: ["mySubscription"],
    queryFn: async () => {
      const response = await axiosSecure.get(
        "/business-owner/subscription/my-subscription",
      );
      return response.data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId) => {
      const payload = {
        planId,
        billingCycle: "monthly",
      };
      const response = await axiosSecure.post(
        "/business-owner/payment/create-checkout-session",
        payload,
      );
      return response.data;
    },
    onSuccess: (res) => {
      if (res?.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to initiate checkout session");
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Payment error occurred",
      );
    },
  });

  const handleUpgrade = (plan) => {
    if (plan.name?.toLowerCase() === "enterprise") {
      setIsContactModalOpen(true);
      return;
    }
    checkoutMutation.mutate(plan.id);
  };

  const plans = [...(plansResponse?.data || [])].sort((a, b) => {
    if (a.name?.toLowerCase() === "enterprise") return 1;
    if (b.name?.toLowerCase() === "enterprise") return -1;
    return 0;
  });
  const currentPlanId = subResponse?.data?.plan?.id;

  if (isLoadingPlans || isLoadingSub) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#2563EB] w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6 sm:gap-0">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Choose Your Plan
          </h2>
          <p className="text-sm text-gray-400">Manage your subscription plan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id || index}
            plan={plan}
            onUpgrade={handleUpgrade}
            isPendingUpgrade={
              checkoutMutation.isPending &&
              checkoutMutation.variables === plan.id
            }
            isCurrentPlan={plan.id === currentPlanId}
          />
        ))}
      </div>

      <EnterpriseContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default Plan;
