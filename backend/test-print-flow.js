import prisma from "./src/app/prisma/client.js";
import { PrinterService } from "./src/app/modules/businessowner/printer/printer.service.js";

async function main() {
  console.log("🔍 Checking database for Business Owner and Orders...");

  // 1. Get the first Business Owner user
  const user = await prisma.user.findFirst({
    where: { role: "BUSINESS_OWNER" },
  });

  if (!user) {
    console.error("❌ No BUSINESS_OWNER user found. Please run: npm run seed");
    return;
  }

  // 2. Get the Business for the Business Owner
  const business = await prisma.business.findFirst({
    where: { ownerId: user.id },
  });

  if (!business) {
    console.error("❌ No Business found for this user.");
    return;
  }

  // 3. Find or Create a test printer with MAC "00:11:62:AA:BB:CC" (matching print-bridge.js)
  const printerMac = "00:11:62:AA:BB:CC";
  let printer = await prisma.printer.findFirst({
    where: { businessId: business.id, serialNumber: printerMac },
  });

  if (!printer) {
    printer = await prisma.printer.create({
      data: {
        businessId: business.id,
        deviceName: "Test Receipt Printer",
        serialNumber: printerMac,
        status: "online",
      },
    });
    console.log(
      `✅ Created test printer in DB: ${printer.deviceName} (${printer.serialNumber})`,
    );
  } else {
    console.log(
      `Found registered printer: ${printer.deviceName} (${printer.serialNumber})`,
    );
  }

  // 4. Find the latest order for this business
  const order = await prisma.order.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    console.warn(
      "⚠️ No orders found. Running the order seeder to seed a test order first...",
    );
    // Import dynamically to run the order seed
    const seedOrder = await import("./prisma/seed-order.js");
    return;
  }
  console.log(
    `Found latest Order: ID: ${order.id}, Customer: ${order.customerName}`,
  );

  // 5. Queue a print job
  console.log("📨 Queueing print job...");
  const jobs = await PrinterService.autoQueueOrderPrint(business.id, order.id);

  if (jobs.length === 0) {
    console.error(
      "❌ Failed to queue print job. Make sure printer is registered.",
    );
    return;
  }
  const job = jobs[0];
  console.log(`✅ Queued Print Job ID: ${job.id}`);

  // 6. Print the formatted receipt text to the console
  console.log("\n================================================");
  console.log("📄 GENERATED RECEIPT ON THERMAL PRINTER (LAYOUT):");
  console.log("================================================");
  console.log(job.rawReceiptText);
  console.log("================================================\n");

  console.log(
    "💡 You can now run the print bridge to send it to your physical default USB printer:",
  );
  console.log("   node print-bridge.js");
}

main()
  .catch((err) => {
    console.error("❌ Test script failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
