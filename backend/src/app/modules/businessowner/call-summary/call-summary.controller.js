import { CallSummaryService } from "./call-summary.service.js";
import { sendResponse } from "../../../utils/sendResponse.js";
import { PdfGenerator } from "../../../utils/pdfGenerator.js";
import { StatusCodes } from "http-status-codes";

const getCallSummaries = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { vapiAgentId, agentId } = req.query;
    const result = await CallSummaryService.getCallSummaries(userId, {
      vapiAgentId,
      agentId,
    });

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Call summaries retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCallSummaryById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await CallSummaryService.getCallSummaryById(userId, id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Call summary retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getCallTranscriptById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await CallSummaryService.getCallTranscriptById(userId, id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Call transcript retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download call summary PDF controller
 */
const downloadCallSummaryPdf = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const callData = await CallSummaryService.getCallDetailsForPdf(userId, id);

    const pdfBuffer = await PdfGenerator.generatePdf(
      "call-summary-pdf",
      callData,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=call_summary_${id}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const CallSummaryController = {
  getCallSummaries,
  getCallSummaryById,
  getCallTranscriptById,
  downloadCallSummaryPdf,
};
