import axios from "axios";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const myProfile = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    res.json(user);
  }
);

//Get User Profile by ID
export const getUserProfileById = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const { userId } = req.params;

    const [user] = await sql`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone_number,
        u.bio,
        u.role,
        u.resume,
        u.resume_public_id,
        u.profile_pic,
        u.profile_pic_public_id,
        u.subscription,
        ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
      FROM users u
      LEFT JOIN user_skills us ON u.user_id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.skill_id
      WHERE u.user_id = ${userId}
      GROUP BY u.user_id;
    `;

    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    res.status(200).json(user); // 🔥 normalized
  }
);


// Update User Profile
export const updateUserProfile = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Unauthorized");
    }

    const { name, phoneNumber, bio } = req.body;
    const newName = name || user.name;
    const newPhoneNumber = phoneNumber || user.phone_number;
    const newBio = bio || user.bio;

    const [updatedUser] = await sql`
        UPDATE users
        SET 
            name = ${newName},
            phone_number = ${newPhoneNumber},
            bio = ${newBio}
        WHERE user_id = ${user.user_id}
        RETURNING user_id, name, email, phone_number, bio, created_at
    `;
    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser,
    });
  }
);

//Add profile picture
export const updateProfilePicture = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) throw new ErrorHandler(401, "Unauthorized");

    const file = req.file; // This comes from multer
    if (!file) throw new ErrorHandler(400, "No file uploaded");

    try {
      const oldPublicId = user.profile_pic_public_id;

      // Convert buffer to base64 data URI
      const base64Buffer = file.buffer.toString("base64");
      const dataURI = `data:${file.mimetype};base64,${base64Buffer}`;

      console.log("📤 Sending to utils service:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        sizeKB: Math.round(file.size / 1024) + " KB"
      });

      // Send as JSON to utils service
      const uploadResponse = await axios.post(
        `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
        {
          buffer: dataURI,
          mimetype: file.mimetype,
          originalname: file.originalname,
          public_id: oldPublicId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 30000,
        }
      );

      const uploadResult = uploadResponse.data;

      console.log("✅ Upload successful:", uploadResult.public_id);

      // Update database
      const [updatedUser] = await sql`
        UPDATE users
        SET profile_pic = ${uploadResult.url},
            profile_pic_public_id = ${uploadResult.public_id}
        WHERE user_id = ${user.user_id}
        RETURNING user_id, name, email, phone_number, bio, profile_pic, profile_pic_public_id, created_at
      `;

      res.status(200).json({
        message: "Profile picture updated successfully",
        updatedUser,
      });
    } catch (error) {
      console.error("❌ Error updating profile picture:", error);
      
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        throw new ErrorHandler(
          error.response?.status || 500,
          error.response?.data?.message || "Failed to upload image to storage service"
        );
      }
      
      throw new ErrorHandler(500, "Internal server error while updating profile picture");
    }
  }
);

//update resume
export const updateResume = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) throw new ErrorHandler(401, "Unauthorized");

    const file = req.file;
    if (!file) throw new ErrorHandler(400, "No file uploaded");

    // ⚡ Create a **NEW unique public_id** using timestamp + filename
    const cleanedName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[()]/g, "");
    const newPublicId = `${Date.now()}_${cleanedName}`;

    // Convert buffer to Base64 data URI
    const base64Buffer = file.buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64Buffer}`;

    // Upload to your upload service
    const { data: uploadResult } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      {
        buffer: dataURI,
        mimetype: file.mimetype,
        originalname: file.originalname,
        public_id: newPublicId, // 🔥 NEW public_id here
      }
    );

    // Update DB with new resume URL + public_id
    const [updatedUser] = await sql`
      UPDATE users
      SET resume = ${uploadResult.url},
          resume_public_id = ${uploadResult.public_id}
      WHERE user_id = ${user.user_id}
      RETURNING user_id, name, email, phone_number, bio, profile_pic,
                profile_pic_public_id, resume, resume_public_id, created_at
    `;

    res.status(200).json({
      message: "Resume updated successfully",
      updatedUser,
    });
  }
);

//Add Skills to User Profile

export const addSkillToUser = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.user_id;
    if (!userId) throw new ErrorHandler(401, "Unauthorized");

    const { skillname } = req.body;
    if (!skillname || skillname.trim() === "")
      throw new ErrorHandler(400, "Skill name is required");

    try {
      await sql`BEGIN`;

      // Validate user exists
      const userRows = await sql`
        SELECT user_id FROM users WHERE user_id = ${userId}
      `;
      if (userRows.length === 0) throw new ErrorHandler(404, "User not found");

      // Insert or get existing skill
      const skillRows = await sql`
        INSERT INTO skills (name)
        VALUES (${skillname.trim()})
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING skill_id
      `;

      if (skillRows.length === 0) {
        throw new ErrorHandler(500, "Skill insert failed");
      }

      const skill = skillRows[0]!;
      const skillId = skill.skill_id;

      // Add mapping
      const insertionResult = await sql`
        INSERT INTO user_skills (user_id, skill_id)
        VALUES (${userId}, ${skillId})
        ON CONFLICT (user_id, skill_id) DO NOTHING
        RETURNING *
      `;

      await sql`COMMIT`;

      return res.status(200).json({
        message:
          insertionResult.length > 0
            ? "Skill added successfully"
            : "Skill already exists for this user",
      });
    } catch (error) {
      console.log("Error While Adding Skill", error);
      await sql`ROLLBACK`;
      next(error);
    }
  }
);

//Remove Skill from User Profile
export const removeSkillFromUser = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const userId = req.user?.user_id;
    if (!userId) throw new ErrorHandler(401, "Unauthorized");
    const { skillname } = req.body;
    if (!skillname || skillname.trim() === "")
      throw new ErrorHandler(400, "Skill name is required");
    // Check if skill exists
    const skillRows = await sql`
      SELECT skill_id FROM skills WHERE name = ${skillname.trim()}
    `;
    if (skillRows.length === 0) throw new ErrorHandler(404, "Skill not found");
    const skillId = skillRows[0]!.skill_id;

    // Delete mapping
    const deletionResult = await sql`
      DELETE FROM user_skills
      WHERE user_id = ${userId} AND skill_id = ${skillId}
      RETURNING *
    `;
    if (deletionResult.length === 0)
      throw new ErrorHandler(404, "Skill not associated with user");

    res.status(200).json({
      message: "Skill removed successfully",
    });
  }
);

//Apply For Job:-

export const applyForJob = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Unauthorized");
    }
    if (user.role !== "jobseeker") {
      throw new ErrorHandler(
        403,
        "Forbidden.!,Only jobseekers can apply for jobs"
      );
    }

    const applicant_id = user.user_id;
    const { job_id } = req.body;

    const resume = user.resume;
    if (!resume) {
      throw new ErrorHandler(
        400,
        "Please upload your resume before applying for jobs"
      );
    }
    if (!job_id) {
      throw new ErrorHandler(400, "Job ID is required to apply for a job");
    }
    //Check if job exists
    const jobRows = await sql`
    SELECT job_id FROM jobs WHERE job_id = ${job_id}
  `;
    console.log("jobroes:-----", jobRows);
    if (jobRows.length === 0) {
      throw new ErrorHandler(404, "Job not found");
    }
    //check if job is active
    const active = await sql`SELECT is_active FROM jobs WHERE job_id=${job_id}`;
    if (!active) {
      throw new ErrorHandler(400, "Job is not active");
    }
    //Check if already applied
    const applicationRows = await sql`
    SELECT application_id FROM applications 
    WHERE job_id = ${job_id} AND applicant_id = ${applicant_id}
  `;
    if (applicationRows.length > 0) {
      throw new ErrorHandler(400, "You have already applied for this job");
    }
    //check if user has an active subscription

    const now = Date.now();

    // const subTime = req.user?.subscription
    //   ? new Date(req.user.subscription).getTime()
    //   : 0;

    // const isSubscribed = subTime > now;

    // if (!isSubscribed) {
    //   throw new ErrorHandler(403, "Please subscribe to apply for jobs");
    // }
    let newApplication;

    try {
      [newApplication] =
        await sql`INSERT INTO applications (job_id,applicant_id,applicant_email,resume,subscribe) VALUES (${job_id},${applicant_id},${user?.email},${resume},${true})`;
    } catch (error: any) {
      console.log("Error While Applying:", error);

      if (error.code === "23505") {
        throw new ErrorHandler(409, "You have already applied for this job");
      }
      throw new ErrorHandler(500, "Internal Server Error");
    }
    res.status(200).json({
      message: "Applied for job successfully",
      application: newApplication,
    });
  }
);

//Get All Applicants of User for a Job
export const getApplicantsForJob = TryCatch(
  async (req: AuthenticatedRequest, res, next) => {
   const applications = await sql`
  SELECT 
    a.*,
    j.title AS job_title,
    j.salary AS job_salary,
    j.location AS job_location
  FROM applications a
  JOIN jobs j ON a.job_id = j.job_id
  WHERE a.applicant_id = ${req.user?.user_id}
`;

    res.status(200).json({
      applications,
    });
  }
);

