import { StatusCodes } from "http-status-codes";
import { TenantsService } from "./tenants.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";
import prisma from "../../../prisma/client.js";
import { createAuditLog } from "../../../utils/auditLogger.js";

const handleError = (res, error) => {
  console.error("Tenants Error:", error);
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

const getAllTenants = async (req, res) => {
  try {
    const result = await TenantsService.getAllTenantsFromDB();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenants fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const createTenant = async (req, res) => {
  try {
    const result = await TenantsService.createTenantInDB(req.body);

    // Log the tenant joining
    await createAuditLog({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: "TENANT_CREATED",
      details: `${req.body.business_name} tenant join your system`,
      ipAddress:
        req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Tenant created successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getTenantById = async (req, res) => {
  try {
    const result = await TenantsService.getTenantByIdFromDB(req.params.id);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const updateTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;

    // Fetch the business before update to know its name and previous status
    const businessBeforeUpdate = await prisma.business.findUnique({
      where: { id: tenantId },
    });

    if (!businessBeforeUpdate) {
      throw new DevBuildError("Tenant not found", StatusCodes.NOT_FOUND);
    }

    const result = await TenantsService.updateTenantInDB(tenantId, req.body);

    // If status is updated to suspended, log the suspension action in the exact format
    if (
      req.body.status === "suspended" &&
      businessBeforeUpdate.status !== "suspended"
    ) {
      await createAuditLog({
        userId: req.user?.id,
        userEmail: req.user?.email,
        action: "TENANT_SUSPENDED",
        details: `${businessBeforeUpdate.name} tenants got suspended`,
        ipAddress:
          req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;

    const result = await TenantsService.deleteTenantFromDB(tenantId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant deleted successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const impersonateTenant = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const systemOwnerId = req.user.id;

    const result = await TenantsService.impersonateTenantInDB(
      tenantId,
      systemOwnerId,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Impersonation tokens generated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const TenantsController = {
  getAllTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant,
  impersonateTenant,
};
