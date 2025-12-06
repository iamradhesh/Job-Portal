// In your multer.js file
import type { NextFunction, Request ,Response} from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();

const uploadFile = multer({ storage }).single('file');

// Wrap it to add logging
const uploadFileWithLogging = (req:Request, res:Response, next:NextFunction) => {
  // console.log("🔍 Multer middleware hit");
  // console.log("Headers:", req.headers);
  // console.log("Content-Type:", req.headers['content-type']);
  
  uploadFile(req, res, (err) => {
    if (err) {
      console.log("❌ Multer error:", err);
      return res.status(400).json({ message: "File upload error", error: err.message });
    }
    // console.log("✅ Multer processed successfully");
    // console.log("📎 req.file:", req.file);
    // console.log("📝 req.body:", req.body);
    next();
  });
};

export default uploadFileWithLogging;