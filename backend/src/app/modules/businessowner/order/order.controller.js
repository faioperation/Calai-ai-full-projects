import { OrderService } from "./order.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { StatusCodes } from "http-status-codes";
import prisma from "../../../prisma/client.js";
import { PrinterService } from "../printer/printer.service.js";

// Get orders controller
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { vapiAgentId, agentId } = req.query;
    const result = await OrderService.getOrders(userId, {
      vapiAgentId,
      agentId,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Orders retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID controller
const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await OrderService.getOrderById(userId, id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Order details retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Download order PDF controller
const downloadOrderPdf = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1. Find the business for this user
    const business = await prisma.business.findFirst({
      where: { ownerId: userId },
    });

    if (!business) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Business not found for this user",
      });
    }

    // 2. Queue print job for the order
    const jobs = await PrinterService.autoQueueOrderPrint(business.id, id);

    if (jobs.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "No printers registered for this business. Please register a printer first.",
      });
    }

    // 3. Return the raw receipt text of the first job as text/plain
    const rawReceiptText = jobs[0].rawReceiptText;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(StatusCodes.OK).send(rawReceiptText);
  } catch (error) {
    next(error);
  }
};

export const OrderController = {
  getOrders,
  getOrderById,
  downloadOrderPdf,
};
