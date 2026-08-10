import { StatusCodes } from "http-status-codes";
import { AuditLogsService } from "./audit_logs.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error) => {
  console.error("Audit Logs Error:", error);
  if (error instanceof DevBuildError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "An internal server error occurred",
  });
};

const getAllAuditLogs = async (req, res) => {
  try {
    const result = await AuditLogsService.getAllAuditLogsFromDB(req.query);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Audit logs fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getAuditLogById = async (req, res) => {
  try {
    const logId = req.params.id;
    const result = await AuditLogsService.getAuditLogByIdFromDB(logId);

    if (!result) {
      throw new DevBuildError("Audit log not found", StatusCodes.NOT_FOUND);
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Audit log fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteAuditLog = async (req, res) => {
  try {
    const logId = req.params.id;

    // Check if the log exists first
    const existingLog = await AuditLogsService.getAuditLogByIdFromDB(logId);
    if (!existingLog) {
      throw new DevBuildError("Audit log not found", StatusCodes.NOT_FOUND);
    }

    const result = await AuditLogsService.deleteAuditLogFromDB(logId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Audit log deleted successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteAllAuditLogs = async (req, res) => {
  try {
    const result = await AuditLogsService.deleteAllAuditLogsFromDB();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "All audit logs deleted successfully",
      count: result.count,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const AuditLogsController = {
  getAllAuditLogs,
  getAuditLogById,
  deleteAuditLog,
  deleteAllAuditLogs,
};
