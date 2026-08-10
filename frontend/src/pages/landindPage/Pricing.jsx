import React, { useState } from "react";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPublic from "@/hooks/useAxiosPublic";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import EnterpriseContactModal from "@/components/EnterpriseContactModal";

const PlanCard = ({
  plan,
  index,
  role,
  onUpgrade,
  isPendingUpgrade,
  isCurrentPlan,
}) => {
  const isPopular = plan.name?.toLowerCase() === "starter" || plan.isPopular;
  const priceValue = plan.priceMonthly;
  const priceDisplay =
    priceValue !== undefined ? `${priceValue}` : plan.price || "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative bg-gradient-to-b from-[#0B1120] to-[#111827] border  ${isPopular ? "border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.15)]" : "border-[#272727]"} p-6 rounded-[28px] flex flex-col gap-6  transition-all group h-full`}
    >
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <div className="bg-[#0B1120] px-4 py-1 rounded-full border border-blue-600 text-white text-[13px] font-semibold whitespace-nowrap">
            Most Popular
          </div>
        </div>
      )}
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
                £{priceDisplay}
              </span>
              <span className="text-gray-500 text-sm font-medium">/month</span>
            </>
          )}
        </div>

        <p className="text-gray-400 text-[13px] leading-relaxed min-h-[40px]">
          {plan.description}
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-2 mb-6">
        {plan.features?.map((feature, idx) => {
          const text = typeof feature === "string" ? feature : feature.text;
          const included =
            typeof feature === "string" ? true : feature.included;
          return (
            <div key={idx} className="flex items-center gap-3">
              {included ? (
                <Check className="w-4 h-4 text-blue-500/80 shrink-0 mt-0.5" />
              ) : (
                <X className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
              )}
              <span
                className={`text-[13px] leading-tight ${included ? "text-gray-300" : "text-gray-600"}`}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {role === "BUSINESS_OWNER" && isCurrentPlan ? (
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
            className="w-full py-2.5 rounded-lg border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPendingUpgrade && <Loader2 className="w-4 h-4 animate-spin" />}
            {plan.name?.toLowerCase() === "enterprise"
              ? "Contact Us"
              : plan.buttonText || "Upgrade plan"}
          </button>
        )}
        
        {plan.name?.toLowerCase() !== "enterprise" && (
          <button
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/#contact';
              }
            }}
            className="w-full py-2.5 rounded-lg border border-[#272727] bg-transparent text-sm text-gray-400 hover:text-white hover:bg-[#1A1A1A] transition-all cursor-pointer flex items-center justify-center"
          >
            Contact Us
          </button>
        )}
      </div>
    </motion.div>
  );
};

const Pricing = () => {
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const role = Cookies.get("role");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { data: plansResponse, isLoading } = useQuery({
    queryKey: ["publicPlans"],
    queryFn: async () => {
      const res = await axiosPublic.get("/free-route/plans");
      return res.data;
    },
  });

  const { data: subResponse } = useQuery({
    queryKey: ["mySubscription"],
    queryFn: async () => {
      const response = await axiosSecure.get(
        "/business-owner/subscription/my-subscription",
      );
      return response.data;
    },
    enabled: role === "BUSINESS_OWNER",
  });

  const plans = [...(plansResponse?.data || [])].sort((a, b) => {
    if (a.name?.toLowerCase() === "enterprise") return 1;
    if (b.name?.toLowerCase() === "enterprise") return -1;
    return 0;
  });
  const currentPlanId = subResponse?.data?.plan?.id;

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
    if (role !== "BUSINESS_OWNER") {
      toast.error("Please log in as to upgrade");
      return;
    }

    if (plan.name?.toLowerCase() === "enterprise") {
      setIsContactModalOpen(true);
      return;
    }

    checkoutMutation.mutate(plan.id);
  };

  return (
    <div id="pricing" className="py-15">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <Header
            titleText={`Simple, Transparent Pricing`}
            subtitleText={`Choose the plan that fits your business needs`}
          />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-10 justify-center">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="animate-spin text-[#0F42FF] w-8 h-8" />
            </div>
          ) : plans.length > 0 ? (
            plans.map((plan, index) => (
              <PlanCard
                key={plan.id || index}
                plan={plan}
                index={index}
                role={role}
                onUpgrade={handleUpgrade}
                isPendingUpgrade={
                  checkoutMutation.isPending &&
                  checkoutMutation.variables === plan.id
                }
                isCurrentPlan={plan.id === currentPlanId}
              />
            ))
          ) : (
            <div className="col-span-full flex justify-center py-12">
              <span className="text-gray-400">
                No plans available right now.
              </span>
            </div>
          )}
        </div>
      </Container>

      <EnterpriseContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default Pricing;
