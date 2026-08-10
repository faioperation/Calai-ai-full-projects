import Breadcrumb from "@/components/Breadcrumb";
import React from "react";
import BillingHistory from "./BillingHistory";
import Plan from "./Plan";
import CurrentPlan from "./CurrentPlan";

const Subscription = () => {
  return (
    <div>
      <Breadcrumb text="You can see your subscription details" />

      <div>
        <CurrentPlan />
      </div>

      <div>
        <Plan />
      </div>

      <div>
        <BillingHistory />
      </div>
    </div>
  );
};

export default Subscription;
