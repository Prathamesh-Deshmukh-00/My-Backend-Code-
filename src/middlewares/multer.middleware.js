import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Temporary folder for file uploads
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using UUID and preserve the file extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."), false); // Reject file
  }
};

// Define limits for file size
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB limit
};

// Configure multer with storage, file filter, and limits
export const upload = multer({
  storage,
  fileFilter,
  limits,
});
