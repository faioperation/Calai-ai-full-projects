import xlsx from "xlsx";
import fs from "fs";
import { PDFParse } from "pdf-parse";

/**
 * Parses a menu file (CSV, XLS, XLSX, or PDF) and returns a clean array of items.
 * Normalizes headers using fuzzy matching for Excel/CSV, and uses regex parsing for PDF.
 *
 * @param {string} filePath - Absolute path to the uploaded file.
 * @returns {Promise<Array<{category: string, name: string, unit: string, price: number}>>}
 */
export const parseMenuFile = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found at path: " + filePath);
  }

  // If it's a PDF, parse raw text using pdf-parse and extract structured items
  if (filePath.toLowerCase().endsWith(".pdf")) {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const text = textResult.text;
    await parser.destroy();

    const lines = text.split(/\r?\n/);
    const parsedItems = [];
    let currentCategory = "General";

    const extractNameAndUnit = (text) => {
      let name = text.trim();
      let unit = "1 pc";

      // Check for text in parentheses
      const parenMatch = name.match(/\(([^)]+)\)/);
      if (parenMatch) {
        unit = parenMatch[1].trim();
        name = name.replace(/\([^)]+\)/, "").trim();
      } else {
        // Check for trailing size/quantity indicators like: 10", 12", 330ml, 500ml, x6, 6pcs, 6 pcs
        const unitRegex = /\b(\d+(?:"|inch|ml|g|pcs|pc|x)\b|\bx\d+)\b/i;
        const unitMatch = name.match(unitRegex);
        if (unitMatch) {
          unit = unitMatch[1].trim();
          name = name.replace(unitRegex, "").trim();
        }
      }

      // Clean up any trailing dashes, dots, or spaces
      name = name.replace(/[-.:\s]+$/, "").replace(/^[-.:\s]+/, "").trim();

      return { name, unit };
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check if line contains a price at the end
      const priceMatch = trimmedLine.match(/(?:£|\$|€)?\s*(\d+(?:\.\d{2})?)\s*$/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        const remainingText = trimmedLine.substring(0, priceMatch.index).trim();
        const { name, unit } = extractNameAndUnit(remainingText);
        if (name) {
          parsedItems.push({
            category: currentCategory,
            name,
            unit,
            price,
          });
        }
      } else {
        // Line does not contain a price.
        // It could be a category heading if it is short and contains only letters/spaces/ampersand/dash
        const isPotentialCategory =
          trimmedLine.length > 2 &&
          trimmedLine.length < 35 &&
          /^[a-z0-9\s&'-]+$/i.test(trimmedLine) &&
          !/^(date|time|phone|customer|order|total|subtotal|items)/i.test(trimmedLine);

        if (isPotentialCategory) {
          currentCategory = trimmedLine;
        }
      }
    }

    return parsedItems;
  }

  // Otherwise, fallback to Excel/CSV sheet parsing
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // xlsx.utils.sheet_to_json handles CSV and Excel sheets naturally
  const rows = xlsx.utils.sheet_to_json(sheet);
  const parsedItems = [];

  for (const row of rows) {
    let category = "General";
    let name = "";
    let unit = "1 pc";
    let price = 0.0;

    for (const key of Object.keys(row)) {
      const normalizedKey = key
        .toLowerCase()
        .trim()
        .replace(/[\s_-]+/g, "");
      const value = row[key];

      if (value === undefined || value === null) continue;

      if (normalizedKey === "category") {
        category = String(value).trim() || "General";
      } else if (
        normalizedKey.includes("name") ||
        normalizedKey.includes("item") ||
        normalizedKey.includes("product")
      ) {
        name = String(value).trim();
      } else if (
        normalizedKey.includes("unit") ||
        normalizedKey.includes("size") ||
        normalizedKey.includes("qty") ||
        normalizedKey.includes("quantity")
      ) {
        unit = String(value).trim() || "1 pc";
      } else if (
        normalizedKey.includes("price") ||
        normalizedKey.includes("rate") ||
        normalizedKey.includes("cost") ||
        normalizedKey.includes("prize")
      ) {
        // Strip non-numeric/dot symbols (e.g. $, €, £, etc.)
        const cleanPrice = String(value).replace(/[^0-9.]/g, "");
        price = parseFloat(cleanPrice) || 0.0;
      }
    }

    // Only add if name is populated
    if (name) {
      parsedItems.push({
        category,
        name,
        unit,
        price,
      });
    }
  }

  return parsedItems;
};
