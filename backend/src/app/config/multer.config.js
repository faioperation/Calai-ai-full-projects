import multer from "multer";
import path from "path";
import fs from "fs";
import { envVars } from "./env.js";

/**
 * Reusable Multer Configuration
 * @param {Object} options - Configuration options
 * @param {string} options.folder - The subfolder within uploads/ (e.g., 'avatars', 'docs')
 * @param {RegExp} options.allowedTypes - Regex of allowed file types (default: images and docs)
 * @param {number} options.maxSize - Max file size in bytes (default: 5MB)
 * @returns {multer.Multer} - Multer instance
 */
export const createMulterUpload = ({
  folder = "others",
  allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/,
  maxSize = 5 * 1024 * 1024,
} = {}) => {
  const uploadPath = path.join(process.cwd(), "uploads", folder);

  // Ensure the directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          `Error: File type not allowed! Allowed types are: ${allowedTypes}`,
        ),
      );
    }
  };

  return multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: fileFilter,
  });
};
