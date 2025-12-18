// upload-service/routes/upload.ts
import express, { type Request, type Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { generateCareerAdvice } from "./controller/careerController.js";

dotenv.config();
const router = express.Router();

interface UploadRequestBody {
  buffer: string; // This is actually the FULL data URI from DataUriParser
  originalname: string;
  mimetype: string;
  public_id?: string;
}
//Upload Route:-
router.post("/upload", async (req: Request, res: Response) => {
  try {
    const { buffer, originalname, mimetype, public_id } =
      req.body as UploadRequestBody;

    console.log("📦 Upload request received");
    console.log("📄 File:", originalname);
    console.log("📋 MIME:", mimetype);

    if (!buffer || !originalname || !mimetype) {
      return res.status(400).json({
        message: "buffer, originalname, and mimetype are required",
      });
    }

    // ✅ FIX: DataUriParser already returns the full data URI
    // Don't add the prefix again!
    const uploadDataURI = buffer; // Already in format: data:mimetype;base64,xxxxx

    const ext = originalname.split(".").pop()?.toLowerCase() || "";
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    const resourceType = imageExtensions.includes(ext) ? "image" : "raw";
    console.log("📁 Resource type:", resourceType);

    let cleanPublicId = public_id
      ? public_id.replace(/\.[^/.]+$/, "")
      : `job-portal/${Date.now()}`;

    cleanPublicId = cleanPublicId.replace(
      "job-portal/job-portal/",
      "job-portal/"
    );

    // Delete old file if updating
    if (public_id) {
      try {
        await cloudinary.uploader.destroy(public_id, {
          resource_type: resourceType,
        });
        console.log("🗑️ Deleted old file:", public_id);
      } catch (err: any) {
        console.log("⚠ Could not delete old file:", err.message);
      }
    }

    // Upload options
    const uploadOptions: any = {
      folder: "job-portal",
      resource_type: resourceType,
      public_id: cleanPublicId.replace("job-portal/", ""),
    };

    // ✅ For raw files (PDFs, docs), preserve the extension
    if (resourceType === "raw") {
      uploadOptions.public_id = `${uploadOptions.public_id}.${ext}`;
    }

    console.log("⚙️ Upload options:", uploadOptions);

    const uploadResult = await cloudinary.uploader.upload(
      uploadDataURI,
      uploadOptions
    );

    console.log("✅ Upload successful:", uploadResult.public_id);

    return res.status(200).json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    console.error("Error details:", error.message);

    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
      details: error.error?.message || "Unknown error",
    });
  }
});

//GenAI ROute:-
router.post("/career",generateCareerAdvice);


export default router;
