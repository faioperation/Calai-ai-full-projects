import { StatusCodes } from "http-status-codes";
import { IndividualTenantService } from "./individual_tenant.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";
import { PdfGenerator } from "../../../utils/pdfGenerator.js";


const handleError = (res, error) => {
  console.error("Individual Tenant Controller Error:", error);
  if (error instanceof DevBuildError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || "An internal server error occurred",
  });
};

const getTenantAgents = async (req, res) => {
  try {
    const businessId = req.params.id;
    const result = await IndividualTenantService.getTenantAgentsFromDB(businessId);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant agents fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getTenantCalls = async (req, res) => {
  try {
    const businessId = req.params.id;
    const result = await IndividualTenantService.getTenantCallsFromDB(businessId);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant call history fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getTenantOrders = async (req, res) => {
  try {
    const businessId = req.params.id;
    const result = await IndividualTenantService.getTenantOrdersFromDB(businessId);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant orders fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const getTenantBillingHistory = async (req, res) => {
  try {
    const businessId = req.params.id;
    const result = await IndividualTenantService.getTenantBillingHistoryFromDB(businessId);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Tenant billing history fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

const downloadOrderPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const orderData = await IndividualTenantService.getOrderDetailsForPdf(id);

    const pdfBuffer = await PdfGenerator.generatePdf("order-pdf", orderData);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=order_${id}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error) {
    return handleError(res, error);
  }
};

export const IndividualTenantController = {
  getTenantAgents,
  getTenantCalls,
  getTenantOrders,
  getTenantBillingHistory,
  downloadOrderPdf,
};
