import axios from "axios";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

// Create Company Controller
export const createCompany = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  // 🔐 Check auth
  if (!user) {
    throw new ErrorHandler(401, "Authentication Required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Only recruiters can create companies");
  }

  const { name, description, website } = req.body;

  // 📝 Validate required fields
  if (!name || !description || !website) {
    throw new ErrorHandler(400, "Name, description and website are required");
  }

  // 🏢 Check if company already exists
  const existingCompany = await sql`
        SELECT company_id FROM companies WHERE name = ${name}
    `;

  if (existingCompany.length > 0) {
    throw new ErrorHandler(
      409,
      `Company with this name: ${name}, already exists`
    );
  }

  // 📁 Multer uploaded file
  const logoFile = req.file;
  //console.log("Logo File:", logoFile);

  if (!logoFile) {
    throw new ErrorHandler(400, "Company logo is required");
  }

  // 🧪 Convert file buffer to base64 data URI (upload service requires this)
  const fileBuffer = getBuffer(logoFile);

  // getBuffer() must return:
  // {
  //   content: "data:image/webp;base64,xxxx",
  //   mimetype: "image/webp"
  // }
  if (!fileBuffer || !fileBuffer.content) {
    throw new ErrorHandler(
      500,
      "Failed to convert logo file to base64 data URI"
    );
  }

  // 🔥 Upload service requires EXACT JSON format:
  // { buffer, originalname, mimetype }
  const uploadPayload = {
    buffer: fileBuffer.content, // full data URI: data:image/...;base64,xxx
    originalname: logoFile.originalname,
    mimetype: logoFile.mimetype,
  };

  // 🌐 Send to Upload Microservice (NO CHANGES NEEDED THERE)
  const { data } = await axios.post(
    `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
    uploadPayload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  // Save company to DB
  const [newCompany] = await sql`
        INSERT INTO companies (
            name,
            description,
            website,
            logo,
            logo_public_id,
            recruiter_id
        )
        VALUES (
            ${name},
            ${description},
            ${website},
            ${data.url},
            ${data.public_id},
            ${user.user_id}
        )
        RETURNING *
    `;

  res.status(201).json({
    status: "Company Created Successfully.!",
    company: newCompany,
  });
});

//Delete Company Controller
export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user  = req.user;
    const {companyId} = req.params;

    const [company] = await sql`
    SELECT logo_public_id FROM companies WHERE company_id = ${companyId} AND recruiter_id = ${user?.user_id}
    `;

    if (!company) {
      throw new ErrorHandler(404, "Company not found or unauthorized");
    }
    await sql ` DELETE FROM companies WHERE company_id = ${companyId}`;

    res.status(200).json({
        message:"Company and all associated jobs have been deleted",
    })
  });
