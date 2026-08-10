process.env.TZ = "Europe/London";

import http from "http";
import app from "./app.js";
import { envVars } from "./app/config/env.js";
import { connectRedis } from "./app/config/redis.config.js";
import prisma from "./app/prisma/client.js";
import { checkAndExpireSubscriptions } from "./app/utils/subscriptionChecker.js";
import { initSocket } from "./app/utils/socket.js";
import cron from "node-cron";
import { runDatabaseCleanup } from "./app/utils/cleanup.js";
import { initWorkingHoursScheduler } from "./app/utils/workingHoursScheduler.js";

let server;

const PORT = envVars.PORT || 8001;

const startServer = async () => {
  try {
    console.log(`Environment: ${envVars.NODE_ENV}`);

    // Connect Redis
    await connectRedis();
    console.log("Redis Connected Successfully 🚚✅");

    // Create HTTP server
    server = http.createServer(app);

    // Initialize Socket.io
    initSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Start subscription checker (run immediately and hourly)
    checkAndExpireSubscriptions();
    setInterval(checkAndExpireSubscriptions, 60 * 60 * 1000);

    // Start working hours AI agent scheduler
    initWorkingHoursScheduler();

    // Start database retention cleanup cron job (runs daily at midnight)
    cron.schedule("0 0 * * *", () => {
      runDatabaseCleanup(30);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start server
startServer();

/**
 * 🔴 Unhandled Promise Rejection
 */
process.on("unhandledRejection", async (err) => {
  console.error("Unhandled Rejection Detected... server shutting down...", err);

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(1);
    });
  } else {
    await prisma.$disconnect();
    process.exit(1);
  }
});

/**
 * 🔴 Uncaught Exception
 */
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception Detected... server shutting down...", err);

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(1);
    });
  } else {
    await prisma.$disconnect();
    process.exit(1);
  }
});

/**
 * 🟡 SIGTERM (Docker / Kubernetes)
 */
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received... shutting down gracefully");

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
});

/**
 * 🟡 SIGINT (Ctrl + C)
 */
process.on("SIGINT", async () => {
  console.log("SIGINT signal received... shutting down gracefully");

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
});
