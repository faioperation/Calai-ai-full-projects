import { StatusCodes } from "http-status-codes";
import prisma from "../../../prisma/client.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const getBusinessForUser = async (userId) => {
  const business = await prisma.business.findFirst({
    where: { ownerId: userId },
  });
  if (!business) {
    throw new DevBuildError(
      "Business not found for this user",
      StatusCodes.NOT_FOUND,
    );
  }
  return business.id;
};

const getPrinters = async (userId) => {
  const businessId = await getBusinessForUser(userId);

  const printers = await prisma.printer.findMany({
    where: { businessId: businessId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const thresholdMs = 60 * 1000; // 60 seconds

  const updatedPrinters = await Promise.all(
    printers.map(async (printer) => {
      if (
        printer.status === "online" &&
        now - new Date(printer.lastSeen) > thresholdMs
      ) {
        return await prisma.printer.update({
          where: { id: printer.id },
          data: { status: "offline" },
        });
      }
      return printer;
    }),
  );

  return updatedPrinters;
};

const createPrinter = async (userId, data) => {
  const businessId = await getBusinessForUser(userId);
  const { device_name, serial_number, ip_address } = data;

  if (!device_name || !serial_number || !ip_address) {
    throw new DevBuildError(
      "Device name, MAC address/Serial number, and Local Printer IP address are all required",
      StatusCodes.BAD_REQUEST,
    );
  }

  const normalizedSerial = serial_number.trim();
  const normalizedIp = ip_address.trim();

  // Check duplicate
  const existing = await prisma.printer.findFirst({
    where: {
      businessId: businessId,
      serialNumber: normalizedSerial,
    },
  });

  if (existing) {
    throw new DevBuildError(
      "A printer with this serial number/MAC address is already registered",
      StatusCodes.BAD_REQUEST,
    );
  }

  return await prisma.printer.create({
    data: {
      businessId: businessId,
      deviceName: device_name.trim(),
      serialNumber: normalizedSerial,
      ipAddress: normalizedIp,
      status: "offline",
    },
  });
};

const updatePrinter = async (userId, printerId, data) => {
  const businessId = await getBusinessForUser(userId);
  const { device_name, serial_number, ip_address } = data;

  const printer = await prisma.printer.findUnique({
    where: { id: printerId },
  });

  if (!printer || printer.businessId !== businessId) {
    throw new DevBuildError("Printer not found", StatusCodes.NOT_FOUND);
  }

  const updateData = {};
  if (device_name) updateData.deviceName = device_name.trim();
  if (ip_address) updateData.ipAddress = ip_address.trim();

  if (serial_number) {
    const normalizedSerial = serial_number.trim();
    if (normalizedSerial !== printer.serialNumber) {
      // Check duplicate
      const existing = await prisma.printer.findFirst({
        where: {
          businessId: businessId,
          serialNumber: normalizedSerial,
          id: { not: printerId },
        },
      });

      if (existing) {
        throw new DevBuildError(
          "Another printer with this serial number/MAC address is already registered",
          StatusCodes.BAD_REQUEST,
        );
      }
      updateData.serialNumber = normalizedSerial;
    }
  }

  return await prisma.printer.update({
    where: { id: printerId },
    data: updateData,
  });
};

const deletePrinter = async (userId, printerId) => {
  const businessId = await getBusinessForUser(userId);

  const printer = await prisma.printer.findUnique({
    where: { id: printerId },
  });

  if (!printer || printer.businessId !== businessId) {
    throw new DevBuildError("Printer not found", StatusCodes.NOT_FOUND);
  }

  await prisma.printer.delete({
    where: { id: printerId },
  });

  return { id: printerId };
};

const getPrinterById = async (userId, printerId) => {
  const businessId = await getBusinessForUser(userId);

  const printer = await prisma.printer.findUnique({
    where: { id: printerId },
  });

  if (!printer || printer.businessId !== businessId) {
    throw new DevBuildError("Printer not found", StatusCodes.NOT_FOUND);
  }

  const now = new Date();
  const thresholdMs = 60 * 1000; // 60 seconds

  if (
    printer.status === "online" &&
    now - new Date(printer.lastSeen) > thresholdMs
  ) {
    return await prisma.printer.update({
      where: { id: printer.id },
      data: { status: "offline" },
    });
  }

  return printer;
};

// Formats an order to clean plain ESC/POS receipt text (40 chars wide)
const generateReceiptText = (order, businessSettings, contactInfo) => {
  const width = 40; // Safe standard width for 80mm & 58mm POS receipt printers (prevents line wrapping overflow)
  const separator = "=".repeat(width);
  const dashedLine = "-".repeat(width);
  const curr = "£"; // Standard currency symbol £

  const center = (text) => {
    if (!text) return "";
    const len = text.toString().length;
    if (len >= width) return text.toString().substring(0, width);
    const spaces = Math.floor((width - len) / 2);
    return " ".repeat(spaces) + text;
  };

  const formatTwoColumns = (left, right) => {
    const leftStr = (left || "").toString();
    const rightStr = (right || "").toString();
    const spacesNeeded = width - leftStr.length - rightStr.length;
    if (spacesNeeded <= 0) {
      return (leftStr + " " + rightStr).substring(0, width);
    }
    return leftStr + " ".repeat(spacesNeeded) + rightStr;
  };

  const lines = [];

  // Business Header (Centered Logo and Details)
  lines.push(separator);

  const logoLines = [
    "   .---.        ",
    "  / ... \\ Calai ",
    "  \\   __/       ",
    "   `.__)        ",
  ];

  logoLines.forEach((line) => {
    lines.push(center(line));
  });

  lines.push(center(businessSettings?.businessName || "RESTAURANT"));
  if (businessSettings?.businessAddress) {
    lines.push(center(businessSettings.businessAddress));
  }
  if (contactInfo?.email) {
    lines.push(center(contactInfo.email));
  }
  if (contactInfo?.phone) {
    lines.push(center(contactInfo.phone));
  }

  lines.push(separator);

  // Order Info
  const orderIdShort = order.id ? `#${order.id.split("-")[0]}` : "N/A";
  lines.push(`Order: ${orderIdShort}`);

  const createdAtDate = order.createdAt
    ? new Date(order.createdAt)
    : new Date();
  const dateStr =
    order.date ||
    createdAtDate.toLocaleDateString("en-GB", { timeZone: "Europe/London" });
  const timeStr =
    order.time ||
    createdAtDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/London",
    });
  lines.push(formatTwoColumns(`Date: ${dateStr}`, `Time: ${timeStr}`));

  // Order Type & Pickup Time / Address
  const orderType = order.orderType || "PICKUP";
  lines.push(`Order Type: ${orderType}`);
  if (orderType === "DELIVERY" && order.deliveryAddress) {
    const fullText = `Address: ${order.deliveryAddress}`;
    for (let i = 0; i < fullText.length; i += width) {
      lines.push(fullText.substring(i, i + width));
    }
  } else if (orderType === "PICKUP") {
    let pickupTimeStr = order.pickupTime;
    if (!pickupTimeStr) {
      const orderDate = order.createdAt
        ? new Date(order.createdAt)
        : new Date();
      const pickupDate = new Date(orderDate.getTime() + 15 * 60 * 1000);
      pickupTimeStr = pickupDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/London",
      });
    }
    lines.push(`Pickup Time: ${pickupTimeStr}`);
  }
  lines.push(dashedLine);

  // Customer
  lines.push(`Customer: ${order.customerName || "N/A"}`);
  lines.push(`Phone: ${order.call?.customerNumber || "N/A"}`);
  lines.push(dashedLine);

  // Items
  lines.push("ITEMS:");
  let itemsList = [];
  if (order.items) {
    if (typeof order.items === "string") {
      try {
        itemsList = JSON.parse(order.items);
      } catch (e) {
        itemsList = [];
      }
    } else if (Array.isArray(order.items)) {
      itemsList = order.items;
    }
  }

  itemsList.forEach((item) => {
    const name = item.product_name || item.item_name || item.name || "Item";
    const qty = parseInt(item.quantity) || 1;
    const unitPrice = parseFloat(
      item.unit_prize || item.unit_price || item.price || 0,
    );
    const itemTotal = parseFloat(item.total_price || qty * unitPrice);

    const leftText = `${qty}x ${name}`;
    const rightText = `${curr}${itemTotal.toFixed(2)}`;

    if (leftText.length + rightText.length >= width) {
      lines.push(leftText.substring(0, width));
      lines.push(formatTwoColumns("", rightText));
    } else {
      lines.push(formatTwoColumns(leftText, rightText));
    }
  });
  lines.push(dashedLine);

  // Totals
  const total = parseFloat(order.totalPrice || 0);
  lines.push(formatTwoColumns("Subtotal:", `${curr}${total.toFixed(2)}`));
  lines.push(formatTwoColumns("TOTAL:", `${curr}${total.toFixed(2)}`));
  lines.push(dashedLine);

  lines.push(center("Thank you for your order!"));
  lines.push(separator);

  return lines.join("\n");
};

const queueOrderPrint = async (userId, printerId, orderId) => {
  const businessId = await getBusinessForUser(userId);

  // Validate printer
  const printer = await prisma.printer.findUnique({
    where: { id: printerId },
  });

  if (!printer || printer.businessId !== businessId) {
    throw new DevBuildError("Printer not found", StatusCodes.NOT_FOUND);
  }

  // Validate order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      call: true,
    },
  });

  if (!order || order.businessId !== businessId) {
    throw new DevBuildError("Order not found", StatusCodes.NOT_FOUND);
  }

  const businessSettings = await prisma.businessSetting.findUnique({
    where: { businessId: businessId },
  });

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { owner: true },
  });

  const contactInfo = {
    phone: business?.owner?.phone || "",
    email: business?.owner?.email || "",
  };

  const rawReceiptText = generateReceiptText(
    order,
    businessSettings,
    contactInfo,
  );

  return await prisma.printJob.create({
    data: {
      printerId: printerId,
      orderId: orderId,
      status: "pending",
      rawReceiptText: rawReceiptText,
      retryCount: 0,
    },
  });
};

const autoQueueOrderPrint = async (businessId, orderId) => {
  try {
    const printers = await prisma.printer.findMany({
      where: { businessId: businessId },
    });

    if (printers.length === 0) {
      console.log(
        `ℹ️ Auto-Print: No printers registered for business: ${businessId}`,
      );
      return [];
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        call: true,
      },
    });

    if (!order) {
      console.error(`❌ Auto-Print Error: Order not found: ${orderId}`);
      return [];
    }

    const businessSettings = await prisma.businessSetting.findUnique({
      where: { businessId: businessId },
    });

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { owner: true },
    });

    const contactInfo = {
      phone: business?.owner?.phone || "",
      email: business?.owner?.email || "",
    };

    const rawReceiptText = generateReceiptText(
      order,
      businessSettings,
      contactInfo,
    );

    const jobs = [];
    for (const printer of printers) {
      const job = await prisma.printJob.create({
        data: {
          printerId: printer.id,
          orderId: orderId,
          status: "pending",
          rawReceiptText: rawReceiptText,
          retryCount: 0,
        },
      });
      console.log(
        `✅ Auto-Print: Queued print job ${job.id} for printer ${printer.deviceName}`,
      );
      jobs.push(job);
    }

    return jobs;
  } catch (error) {
    console.error("❌ Auto-Print Error:", error);
    return [];
  }
};

const handlePrinterPoll = async (printerMAC, statusCode) => {
  if (!printerMAC) {
    console.warn("CloudPRNT: Missing printerMAC in poll request");
    return { jobReady: false };
  }

  const cleanMac = printerMAC.toLowerCase().replace(/[:-]/g, "");

  // Find printer in the schema using camelCase
  let printer = await prisma.printer.findFirst({
    where: {
      OR: [
        { serialNumber: printerMAC },
        { serialNumber: printerMAC.toLowerCase() },
        { serialNumber: cleanMac },
      ],
    },
  });

  if (!printer) {
    console.warn(
      `CloudPRNT: Unregistered printer MAC ${printerMAC} attempted to poll`,
    );
    return { jobReady: false };
  }

  // Update status and timestamp
  let status = "online";
  if (
    statusCode &&
    (statusCode.startsWith("4") || statusCode.startsWith("5"))
  ) {
    console.warn(
      `CloudPRNT: Printer ${printer.id} reported error status code ${statusCode}`,
    );
  }

  await prisma.printer.update({
    where: { id: printer.id },
    data: {
      status,
      lastSeen: new Date(),
    },
  });

  // Find oldest pending job in printJob model
  const pendingJob = await prisma.printJob.findFirst({
    where: {
      printerId: printer.id,
      status: "pending",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (pendingJob) {
    // Lock job to printing state
    await prisma.printJob.update({
      where: { id: pendingJob.id },
      data: {
        status: "printing",
      },
    });

    return {
      jobReady: true,
      mediaTypes: ["text/plain"],
      jobToken: pendingJob.id,
    };
  }

  return { jobReady: false };
};

const getPrintJobContent = async (jobToken) => {
  if (!jobToken) {
    throw new Error("Job token is required");
  }

  const job = await prisma.printJob.findUnique({
    where: { id: jobToken },
  });

  if (!job) {
    throw new Error(`Print job not found for token ${jobToken}`);
  }

  return job.rawReceiptText || "";
};

const confirmPrintJob = async (jobToken, code) => {
  if (!jobToken) {
    throw new Error("Job token is required");
  }

  const job = await prisma.printJob.findUnique({
    where: { id: jobToken },
  });

  if (!job) {
    throw new Error(`Print job not found for token ${jobToken}`);
  }

  const isSuccess =
    code && (code.startsWith("2") || code === "0" || code === "200");

  await prisma.printJob.update({
    where: { id: jobToken },
    data: {
      status: isSuccess ? "completed" : "failed",
      retryCount: isSuccess ? job.retryCount : { increment: 1 },
    },
  });

  // Update printer lastSeen
  await prisma.printer.update({
    where: { id: job.printerId },
    data: {
      lastSeen: new Date(),
    },
  });

  return { success: true };
};

export const PrinterService = {
  getPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
  queueOrderPrint,
  autoQueueOrderPrint,
  handlePrinterPoll,
  getPrintJobContent,
  confirmPrintJob,
  generateReceiptText,
};
