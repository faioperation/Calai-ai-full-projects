import prisma from "../../../prisma/client.js";
import { VapiLib } from "../../../lib/vapi.js";
import { format } from "date-fns";

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

export const OrderService = {
  getOrders,
  getOrderById,
};
