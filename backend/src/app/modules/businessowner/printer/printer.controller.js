import { StatusCodes } from "http-status-codes";
import { PrinterService } from "./printer.service.js";
import DevBuildError from "../../../lib/DevBuildError.js";

const handleError = (res, error, context = "Printer Management") => {
  console.error(`${context} Error:`, error);
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

const getPrinters = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await PrinterService.getPrinters(userId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Printers fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Get Printers");
  }
};

const getPrinterById = async (req, res) => {
  try {
    const userId = req.user.id;
    const printerId = req.params.id;
    const result = await PrinterService.getPrinterById(userId, printerId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Printer fetched successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Get Printer By ID");
  }
};

const createPrinter = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await PrinterService.createPrinter(userId, req.body);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Printer registered successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Create Printer");
  }
};

const updatePrinter = async (req, res) => {
  try {
    const userId = req.user.id;
    const printerId = req.params.id;
    const result = await PrinterService.updatePrinter(
      userId,
      printerId,
      req.body,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Printer updated successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Update Printer");
  }
};

const deletePrinter = async (req, res) => {
  try {
    const userId = req.user.id;
    const printerId = req.params.id;
    const result = await PrinterService.deletePrinter(userId, printerId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Printer deleted successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Delete Printer");
  }
};

const queueOrderPrint = async (req, res) => {
  try {
    const userId = req.user.id;
    const printerId = req.params.id;
    const { orderId } = req.body;

    if (!orderId) {
      throw new DevBuildError("Order ID is required", StatusCodes.BAD_REQUEST);
    }

    const result = await PrinterService.queueOrderPrint(
      userId,
      printerId,
      orderId,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Print job queued successfully",
      data: result,
    });
  } catch (error) {
    return handleError(res, error, "Queue Print Job");
  }
};

const handlePrinterPoll = async (req, res) => {
  try {
    const { printerMAC, statusCode } = req.body;
    console.log(
      `CloudPRNT Poll: Received poll from printer ${printerMAC} with status ${statusCode}`,
    );

    const result = await PrinterService.handlePrinterPoll(
      printerMAC,
      statusCode,
    );

    if (result.jobReady) {
      return res.status(StatusCodes.OK).json(result);
    } else {
      // Star CloudPRNT accepts 204 No Content or 200 with jobReady: false
      return res.status(StatusCodes.NO_CONTENT).send();
    }
  } catch (error) {
    console.error("CloudPRNT Poll Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "An internal error occurred",
    });
  }
};

const handlePrinterGetJob = async (req, res) => {
  try {
    const jobToken =
      req.query.jobToken || req.query.token || req.query.jobtoken;
    console.log(
      `CloudPRNT GetJob: Requesting job content for token: ${jobToken}`,
    );

    const receiptText = await PrinterService.getPrintJobContent(jobToken);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(StatusCodes.OK).send(receiptText);
  } catch (error) {
    console.error("CloudPRNT GetJob Error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send("Error generating receipt");
  }
};

const handlePrinterConfirmJob = async (req, res) => {
  try {
    const jobToken =
      req.query.jobToken || req.query.token || req.query.jobtoken;
    const code = req.query.code;
    const mac = req.query.mac;

    console.log(
      `CloudPRNT ConfirmJob: Received confirmation for token: ${jobToken}, status code: ${code}, MAC: ${mac}`,
    );

    await PrinterService.confirmPrintJob(jobToken, code);

    // Respond with empty 200 OK (no body, per protocol)
    return res.status(StatusCodes.OK).send();
  } catch (error) {
    console.error("CloudPRNT ConfirmJob Error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

const downloadPrintBridge = async (req, res) => {
  try {
    const AdmZip = (await import("adm-zip")).default;
    const fs = (await import("fs")).default;
    const path = (await import("path")).default;

    const zip = new AdmZip();

    // 1. Add print-bridge.js
    const bridgeScriptPath = path.resolve("print-bridge.js");
    if (fs.existsSync(bridgeScriptPath)) {
      zip.addLocalFile(bridgeScriptPath);
    }

    // 2. Add config.json (Dynamically pre-fill based on server env and query params)
    const backendUrl = process.env.BACKEND_URL
      ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api`
      : `${req.protocol}://${req.get("host")}/api`;

    const sampleConfig = {
      BACKEND_URL: backendUrl,
      PRINTER_TOKEN: req.query.token || "PASTE_YOUR_PRINTER_TOKEN_HERE",
      PRINTER_MAC: req.query.mac || "PASTE_YOUR_PRINTER_MAC_HERE",
      PRINTER_TYPE: req.query.type || "NETWORK",
      PRINTER_IP: req.query.ip || "PASTE_YOUR_LOCAL_PRINTER_IP_HERE",
      PRINTER_PORT: Number(req.query.port) || 9100,
      POLL_INTERVAL_MS: 5000,
    };
    zip.addFile(
      "config.json",
      Buffer.from(JSON.stringify(sampleConfig, null, 2), "utf-8"),
    );

    // 3. Add start.bat (Auto Node.js Downloader & Launcher)
    const startBatContent = `@echo off
title Calai Thermal Print Bridge
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js detected. Starting Calai Print Bridge...
    node print-bridge.js
    goto :END
)

if exist "node.exe" (
    echo ✅ Portable Node.js runtime detected. Starting Calai Print Bridge...
    .\\node.exe print-bridge.js
    goto :END
)

echo ====================================================
echo ⚡ Node.js is not installed on this computer.
echo 📥 Automatically downloading portable Node.js runtime...
echo ====================================================
echo.

curl.exe -L -o node.exe https://nodejs.org/dist/v20.18.0/win-x64/node.exe

if exist "node.exe" (
    echo.
    echo ✅ Node.js runtime ready! Starting Calai Thermal Print Bridge...
    .\\node.exe print-bridge.js
) else (
    echo.
    echo 💡 Automatic download failed. Please download Node.js manually from https://nodejs.org
    pause
)

:END
pause
`;
    zip.addFile("start.bat", Buffer.from(startBatContent, "utf-8"));

    // 4. Add package.json
    const packageJsonContent = {
      name: "calai-print-bridge",
      version: "1.0.0",
      main: "print-bridge.js",
      type: "module",
      dependencies: {
        axios: "^1.6.0",
      },
    };
    zip.addFile(
      "package.json",
      Buffer.from(JSON.stringify(packageJsonContent, null, 2), "utf-8"),
    );

    // 5. Add README.txt
    const readmeContent = `================================================
   Calai Thermal Print Bridge - Setup Guide
================================================

1. Extract all files in this ZIP archive to a folder.
2. Open config.json and update:
   - "PRINTER_TOKEN": Your printer token from Calai Dashboard.
   - "PRINTER_IP": Your printer's local IP address (e.g. 192.168.0.100).
3. Double-click start.bat to launch the bridge!

The bridge will automatically catch confirmed orders from Calai VPS
and print them instantly to your 80mm ESC/POS Ethernet/Wi-Fi printer.
`;
    zip.addFile("README.txt", Buffer.from(readmeContent, "utf-8"));

    const zipBuffer = zip.toBuffer();

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Calai-Print-Bridge.zip"',
    );
    return res.send(zipBuffer);
  } catch (error) {
    return handleError(res, error, "Download Print Bridge");
  }
};

export const PrinterController = {
  getPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
  queueOrderPrint,
  handlePrinterPoll,
  handlePrinterGetJob,
  handlePrinterConfirmJob,
  downloadPrintBridge,
};
