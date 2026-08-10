import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generates a PDF buffer from an EJS template.
const generatePdf = async (templateName, data) => {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      `${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, { order: data });

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};

export const PdfGenerator = {
  generatePdf,
};
