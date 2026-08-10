import { AIAgentService } from "./ai-training.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const getAgents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await AIAgentService.getAgents(userId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Agents retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AIAgentController = {
  getAgents,
};
