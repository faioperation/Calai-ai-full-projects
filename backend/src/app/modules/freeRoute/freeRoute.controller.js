import { SubscriptionService } from "../businessowner/subscription/subscription.service.js";

const getPlans = async (req, res, next) => {
  try {
    const plans = await SubscriptionService.getAllPlansFromDB();
    const publicPlans = plans.map(
      ({ stripeMonthlyPriceId, stripeYearlyPriceId, ...rest }) => rest,
    );

    return res.status(200).json({
      success: true,
      message: "Public plans retrieved successfully",
      data: publicPlans,
    });
  } catch (error) {
    next(error);
  }
};

export const FreeRouteController = {
  getPlans,
};
