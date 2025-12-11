// multer.ts
import type { NextFunction, Request, Response } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

// Allowed file types (PDF + Images)
const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml"
];


const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  }
}).single("file");

// ✨ Clean wrapper — no spam logging, no base64 output
const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        message: "File upload error",
        error: err.message
      });
    }

    // Safe metadata logging ONLY (no buffers)
    if (req.file) {
      console.log("Uploaded file:", {
        name: req.file.originalname,
        type: req.file.mimetype,
        sizeKB: Math.round(req.file.size / 1024) + " KB"
      });
    }

    next();
  });
};

export default uploadFile;
