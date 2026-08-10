import prisma from "../prisma/client.js";

// Creates an audit log entry in the database.
export const createAuditLog = async (
  { userId, userEmail, action, details, ipAddress },
  tx = prisma,
) => {
  try {
    return await tx.auditLog.create({
      data: {
        userId,
        userEmail,
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};
