import { ItemManagementService } from "./item_management.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";

/**
 * Controller to fetch all menu items for the business owner.
 */
const getItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { vapiAgentId, agentId } = req.query;
    const items = await ItemManagementService.getItems(userId, {
      vapiAgentId,
      agentId,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Menu items retrieved successfully",
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to manually create a menu item.
 */
const createItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const itemData = req.body;
    const newItem = await ItemManagementService.createItem(userId, itemData);

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Menu item created successfully",
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to manually update a menu item.
 */
const updateItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const itemData = req.body;
    const updatedItem = await ItemManagementService.updateItem(
      userId,
      id,
      itemData,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Menu item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete a menu item.
 */
const deleteItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await ItemManagementService.deleteItem(userId, id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Menu item deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to upload a new menu file for an agent and sync it with the AI Service and database.
 */
const updateMenuFile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vapiAgentId = req.query.vapiAgentId || req.body.vapiAgentId;
    const file = req.file;

    if (!vapiAgentId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "vapiAgentId is required",
      });
    }

    if (!file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "menu_file is required",
      });
    }

    const result = await ItemManagementService.updateMenuFileInDB(
      userId,
      vapiAgentId,
      file,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Menu items uploaded and synced successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const ItemManagementController = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  updateMenuFile,
};
