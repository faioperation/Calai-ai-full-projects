import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { envVars } from "../config/env.js";
import DevBuildError from "../lib/DevBuildError.js";

// Needed because __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//         MAIL TRANSPORTER

// secure: true  → port 465 (SSL)
// secure: false → port 587 (STARTTLS) ← Gmail
const isSSLPort = Number(envVars.EMAIL_SENDER.SMTP_PORT) === 465;

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  secure: isSSLPort,
  requireTLS: !isSSLPort, // force STARTTLS upgrade on port 587
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
});

// SEND EMAIL

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData = {},
  attachments = [],
}) => {
  try {
    const templatePath = path.join(
      __dirname,
      "template",
      `${templateName}.ejs`,
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
      })),
    });

    console.log(`📧 Email sent to ${to} | ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error?.message || error);
    if (envVars.NODE_ENV === "production") {
      throw new DevBuildError("Failed to send email", 500);
    }
    console.log("⚠️ Email sending skipped in development.");
  }
};
