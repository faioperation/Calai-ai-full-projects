import prisma from "../../../prisma/client.js";
import { VapiLib } from "../../../lib/vapi.js";
import { format } from "date-fns";
import { StatusCodes } from "http-status-codes";
import DevBuildError from "../../../lib/DevBuildError.js";
import { PrinterService } from "../printer/printer.service.js";

// Get orders for a business owner
const getOrders = async (userId, filters = {}) => {
  // 1. Find the business for this user
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  // 2. Fetch orders linked to this business (populated by webhook)
  const whereClause = { businessId: business.id };

  if (filters.vapiAgentId) {
    whereClause.call = {
      vapiAgentId: filters.vapiAgentId,
    };
  } else if (filters.agentId) {
    const agent = await prisma.agent.findFirst({
      where: { id: filters.agentId, businessId: business.id },
    });
    if (agent) {
      whereClause.call = {
        vapiAgentId: agent.vapiAgentId,
      };
    }
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      call: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 3. Format orders for the UI
  const formattedOrders = orders.map((order) => {
    const createdAt = new Date(order.createdAt);

    return {
      id: order.id,
      callId: order.callId,
      customerName: order.customerName,
      time: format(createdAt, "h:mm a"),
      date: format(createdAt, "dd/MM/yyyy"),
      number: order.call?.customerNumber || "N/A",
      totalPrice: order.totalPrice,
      items: order.items,
      orderType: order.orderType,
      deliveryAddress: order.deliveryAddress,
    };
  });

  return formattedOrders;
};

// Get order details by ID
const getOrderById = async (userId, orderId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
    include: { businessSettings: true },
  });

  if (!business) {
    throw new Error("Business not found for this user");
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, businessId: business.id },
    include: {
      call: true,
    },
  });

  if (!order) {
    throw new Error("Order not found or access denied");
  }

  const createdAt = new Date(order.createdAt);

  return {
    id: order.id,
    customerName: order.customerName,
    customerNumber: order.call?.customerNumber || "N/A",
    totalPrice: order.totalPrice,
    time: format(createdAt, "h:mm a"),
    date: format(createdAt, "dd/MM/yyyy"),
    items: order.items,
    callId: order.callId,
    businessName: business.businessSettings?.businessName || business.name,
    businessAddress:
      business.businessSettings?.businessAddress || "Not specified",
    orderType: order.orderType,
    deliveryAddress: order.deliveryAddress,
  };
};

// Get raw receipt text without creating any print jobs or requiring registered printers
const getOrderReceiptText = async (userId, orderId, role) => {
  // 1. Find the order first
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      call: true,
    },
  });

  if (!order) {
    throw new DevBuildError("Order not found", StatusCodes.NOT_FOUND);
  }

  // 2. Find the business for this order
  const business = await prisma.business.findUnique({
    where: { id: order.businessId },
    include: { owner: true, businessSettings: true },
  });

  if (!business) {
    throw new DevBuildError("Business not found for this order", StatusCodes.NOT_FOUND);
  }

  // 3. Authorization check
  if (role === "BUSINESS_OWNER" && business.ownerId !== userId) {
    throw new DevBuildError("Access denied: You do not own this business", StatusCodes.FORBIDDEN);
  }

  const contactInfo = {
    phone: business.owner?.phone || "",
    email: business.owner?.email || "",
  };

  const rawReceiptText = PrinterService.generateReceiptText(
    order,
    business.businessSettings,
    contactInfo,
  );

  return rawReceiptText;
};

export const OrderService = {
  getOrders,
  getOrderById,
  getOrderReceiptText,
};
