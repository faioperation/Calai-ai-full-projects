import prisma from "../../../prisma/client.js";
import { format } from "date-fns";

const getTenantAgentsFromDB = async (businessId) => {
  const agents = await prisma.agent.findMany({
    where: {
      businessId,
    },
  });

  return agents.map((agent) => ({
    id: agent.id,
    name: agent.name || "N/A",
    vapi_agent_id: agent.vapiAgentId || "N/A",
    status: agent.status,
    created_date: "N/A", // Agent schema does not have a createdAt field
  }));
};

const getTenantCallsFromDB = async (businessId) => {
  const calls = await prisma.call.findMany({
    where: {
      businessId,
    },
    include: {
      callSummary: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return calls.map((call) => {
    const createdAt = new Date(call.createdAt);

    // Format duration in minutes/seconds or "N/A" if 0/null
    let durationFormatted = "N/A";
    if (call.duration !== null && call.duration !== undefined) {
      const minutes = Math.floor(call.duration / 60);
      const seconds = call.duration % 60;
      durationFormatted =
        minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;
    }

    return {
      id: call.id,
      caller_id: call.customerNumber || "N/A",
      duration: durationFormatted,
      time: format(createdAt, "h:mm a"),
      date: format(createdAt, "dd/MM/yyyy"),
      summary: call.callSummary?.summary || "N/A",
      transcript: call.callSummary?.transcript || "N/A",
    };
  });
};

const getTenantOrdersFromDB = async (businessId) => {
  const orders = await prisma.order.findMany({
    where: {
      businessId,
    },
    include: {
      call: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map((order) => {
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
};

const getTenantBillingHistoryFromDB = async (businessId) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      businessId,
    },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return invoices.map((invoice) => ({
    date: invoice.createdAt,
    plan: invoice.subscription?.plan?.name || "N/A",
    invoice_no: invoice.invoiceNo,
    amount: invoice.amount,
    status: invoice.status,
  }));
};

const getOrderDetailsForPdf = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      call: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const business = await prisma.business.findUnique({
    where: { id: order.businessId },
    include: { businessSettings: true },
  });

  if (!business) {
    throw new Error("Business not found for this order");
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

export const IndividualTenantService = {
  getTenantAgentsFromDB,
  getTenantCallsFromDB,
  getTenantOrdersFromDB,
  getTenantBillingHistoryFromDB,
  getOrderDetailsForPdf,
};

