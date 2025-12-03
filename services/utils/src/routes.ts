import express from "express";
import cloudinary from "cloudinary";
const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).send("OK");
});

router.post("/upload", async (req, res) => {
  try {
    const { buffer, public_id, filename, dataURI } = req.body;

    console.log("📦 Upload request received");
    console.log("Has dataURI:", !!dataURI);
    console.log("Has buffer:", !!buffer);
    console.log("Filename:", filename);

    // Support both dataURI (from getBuffer) and raw buffer
    let uploadDataURI;
    let detectedFilename = filename;

    if (dataURI) {
      uploadDataURI = dataURI;
      
      if (!detectedFilename) {
        const mimeMatch = dataURI.match(/data:([^;]+);/);
        if (mimeMatch && mimeMatch[1] === 'application/pdf') {
          detectedFilename = 'document.pdf';
        }
      }
      console.log("📄 Using provided dataURI");
    } else if (buffer) {
      if (!buffer) {
        return res.status(400).json({ message: "Buffer or dataURI is required" });
      }
      
      const bufferData = Buffer.from(buffer);
      const base64 = bufferData.toString("base64");
      
      const isPDF = detectedFilename?.toLowerCase().endsWith('.pdf');
      const mimeType = isPDF ? 'application/pdf' : 'application/octet-stream';
      uploadDataURI = `data:${mimeType};base64,${base64}`;
      
      console.log("📦 Converted buffer to dataURI");
    } else {
      return res.status(400).json({ message: "Buffer or dataURI is required" });
    }

    // Delete old file if exists
    if (public_id) {
      try {
        await cloudinary.v2.uploader.destroy(public_id, {
          resource_type: "raw"
        });
        console.log("🗑️ Old file deleted");
      } catch (err: any) {
        console.log("⚠️ Could not delete old file:", err.message);
      }
    }

    // Detect file type
    const isPDF = detectedFilename?.toLowerCase().endsWith('.pdf') || uploadDataURI.includes('application/pdf');
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(detectedFilename || '') || 
                    uploadDataURI.match(/data:image\/(jpeg|jpg|png|gif|webp|svg)/);
    
    let uploadResult;

    if (isImage) {
      console.log("📸 Uploading image...");
      uploadResult = await cloudinary.v2.uploader.upload(uploadDataURI, {
        folder: "job-portal",
        resource_type: "image"
      });
    } else {
      // Clean filename: remove extension, spaces, special chars
      let cleanFilename = detectedFilename || 'document';
      
      // Extract extension
      const extension = cleanFilename.match(/\.([^.]+)$/)?.[1] || 'pdf';
      
      cleanFilename = cleanFilename
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[^a-zA-Z0-9_-]/g, "_") // Replace spaces and special chars with underscore
        .toLowerCase();
      
      const timestamp = Date.now();
      const publicId = `${timestamp}_${cleanFilename}`;
      
      // console.log("📄 Uploading file as raw...");
      // console.log("Clean public_id:", publicId);
      // console.log("Extension:", extension);
      
      uploadResult = await cloudinary.v2.uploader.upload(uploadDataURI, {
        folder: "job-portal",
        resource_type: "raw",
        public_id: publicId,
        format: extension, // Explicitly set the format/extension
      });
    }

    // console.log("✅ Upload successful");
    // console.log("Public ID:", uploadResult.public_id);
    // console.log("Secure URL:", uploadResult.secure_url);
    // console.log("Format:", uploadResult.format);

    // Use the secure_url directly - it should already have the correct extension
    let finalUrl = uploadResult.secure_url;
    
    console.log("📎 Final URL:", finalUrl);

    res.status(200).json({
      url: finalUrl,
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format
    });
  } catch (error: any) {
    console.log("❌ UPLOAD ERROR:", error);
    console.log("Error details:", error.error);
    res.status(500).json({ 
      message: "Upload failed", 
      error: error.message || error,
      details: error.error?.message || null
    });
  }
});

export default router;