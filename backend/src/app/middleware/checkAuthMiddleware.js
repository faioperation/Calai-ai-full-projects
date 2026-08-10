import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { envVars } from "../config/env.js";

export const checkAuthMiddleware =
  (...allowedRoles) =>
  async (req, res, next) => {
    console.log("🔥 Auth middleware hit:", req.originalUrl);

    try {
      let token = req.headers.authorization;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

      const jwtToken = token.replace(/^Bearer\s*/i, "");
      const decoded = jwt.verify(jwtToken, envVars.JWT_SECRET_TOKEN);

      // Determine which table to search based on the role or route
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden",
        });
      }

      const isResetRoute = req.originalUrl.includes("/reset-password");

      if (!user.isVerified && !isResetRoute) {
        return res.status(403).json({
          success: false,
          message: "User is not verified. Please verify your email.",
        });
      }

      // Check if business account is suspended
      if (user.role === "BUSINESS_OWNER") {
        const business = await prisma.business.findFirst({
          where: { ownerId: user.id },
          select: { status: true },
        });

        if (business && business.status === "suspended") {
          return res.status(403).json({
            success: false,
            message: "Your business account has been suspended by the administrator.",
          });
        }
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
