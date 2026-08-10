import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { notFound } from "./app/middleware/notFound.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandeler.js";
import { router } from "./app/router/index.js";
import passport from "passport";
import "./app/config/passport.config.js";
dotenv.config();

const app = express();

// Global middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(passport.initialize());

// Routes
app.use("/api", router);
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => {
  res.send("AI-driven voice ordering and calling platform server is running");
});

// 404 handler (must be after routes)
app.use(notFound);

// Global error handler (always last)
app.use(globalErrorHandler);

export default app;
