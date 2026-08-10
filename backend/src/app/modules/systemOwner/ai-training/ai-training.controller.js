import { AIAgentService } from "./ai-training.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

const createAgent = async (req, res, next) => {
  try {
    const { agent_name, businessId } = req.body;
    const userId = req.user.id;

    const rulesFile = req.files?.["rules_file"]?.[0];
    const menuFile = req.files?.["menu_file"]?.[0];

    if (!rulesFile || !menuFile) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Both business rules and menu files are required",
      });
    }

    const result = await AIAgentService.createAgent(
      agent_name,
      rulesFile,
      menuFile,
      businessId,
      userId,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "AI Agent created and provisioned successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAgents = async (req, res, next) => {
  try {
    const { businessId } = req.query;
    const result = await AIAgentService.getAgents(businessId);

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

const deleteAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AIAgentService.deleteAgent(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Agent and all related data deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const updateSpecialOffers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;

    const result = await AIAgentService.updateSpecialOffers(id, enabled);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Special offers updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const uploadSpecialOffers = async (req, res, next) => {
  try {
    const assistant_id =
      req.params.id || req.body.assistant_id || req.body.agentId;
    const specialOffersFile =
      req.files?.["special_offers_file"]?.[0] || req.file;
    const { special_offers_text, special_offers_enabled } = req.body;

    if (!assistant_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "assistant_id (or agent ID parameter) is required",
      });
    }

    if (!specialOffersFile) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "special_offers_file is required",
      });
    }

    const result = await AIAgentService.uploadSpecialOffers(
      assistant_id,
      specialOffersFile,
      special_offers_text,
      special_offers_enabled,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Special offers uploaded and processed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AIAgentController = {
  createAgent,
  getAgents,
  deleteAgent,
  updateSpecialOffers,
  uploadSpecialOffers,
};
