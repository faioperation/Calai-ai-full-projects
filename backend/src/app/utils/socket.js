import { Server } from "socket.io";
import prisma from "../prisma/client.js";
import { format } from "date-fns";

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket client connected: ${socket.id}`);

    // Join room for a specific business ID
    socket.on("join-business-room", (businessId) => {
      if (businessId) {
        socket.join(`business_${businessId}`);
        console.log(`🔌 Socket client ${socket.id} joined room: business_${businessId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

export const notifyNewOrder = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { call: true },
    });

    if (!order) {
      console.error(`❌ Order not found for socket notification: ${orderId}`);
      return;
    }

    const createdAt = new Date(order.createdAt);
    const formattedOrder = {
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

    if (io) {
      io.to(`business_${order.businessId}`).emit("order:confirmed", formattedOrder);
      console.log(`⚡ Order confirmed event emitted to room: business_${order.businessId}`);
    } else {
      console.warn("⚠️ Socket.io is not initialized, could not emit order:confirmed event.");
    }
  } catch (error) {
    console.error("❌ Error notifying new order via socket:", error);
  }
};
