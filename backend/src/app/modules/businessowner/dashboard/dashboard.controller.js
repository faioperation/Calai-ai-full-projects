import { DashboardService } from "./dashboard.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

/**
 * Get dashboard stats
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await DashboardService.getDashboardStats(userId);
    const graphData = await DashboardService.getDashboardGraphData(userId);
    const overallReport = await DashboardService.getOverallReport(userId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard data retrieved successfully",
      data: {
        stats,
        graphData,
        overallReport,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const DashboardController = {
  getStats,
};
