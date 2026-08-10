import prisma from "../../../prisma/client.js";

// Fetch all audit logs with pagination, search, and filtering
const getAllAuditLogsFromDB = async (query) => {
  const {
    page = 1,
    limit = 10,
    searchTerm,
    action,
    userEmail,
    startDate,
    endDate,
  } = query;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const whereClause = {};

  // Exact action filtering
  if (action) {
    whereClause.action = action;
  }

  // Exact or partial email filtering
  if (userEmail) {
    whereClause.userEmail = {
      contains: userEmail,
      mode: "insensitive",
    };
  }

  // Multi-field text search
  if (searchTerm) {
    whereClause.OR = [
      { action: { contains: searchTerm, mode: "insensitive" } },
      { userEmail: { contains: searchTerm, mode: "insensitive" } },
      { details: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // Created date range filtering
  if (startDate || endDate) {
    whereClause.createdAt = {};

    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = end;
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limitNum,
    }),
    prisma.auditLog.count({
      where: whereClause,
    }),
  ]);

  return {
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPage: Math.ceil(total / limitNum),
    },
    data: logs,
  };
};

// Fetch a single audit log by its ID
const getAuditLogByIdFromDB = async (id) => {
  return await prisma.auditLog.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

// Delete a single audit log by its ID
const deleteAuditLogFromDB = async (id) => {
  return await prisma.auditLog.delete({
    where: { id },
  });
};

// Delete all audit logs from the database
const deleteAllAuditLogsFromDB = async () => {
  return await prisma.auditLog.deleteMany({});
};

export const AuditLogsService = {
  getAllAuditLogsFromDB,
  getAuditLogByIdFromDB,
  deleteAuditLogFromDB,
  deleteAllAuditLogsFromDB,
};
