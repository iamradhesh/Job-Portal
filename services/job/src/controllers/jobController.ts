import axios from "axios";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { get } from "http";
import { applicationStatusUpdateTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";

// Create Company Controller
export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
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
  }
);

//Delete Company Controller
export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { companyId } = req.params;

    const [company] = await sql`
    SELECT logo_public_id FROM companies WHERE company_id = ${companyId} AND recruiter_id = ${user?.user_id}
    `;

    if (!company) {
      throw new ErrorHandler(404, "Company not found or unauthorized");
    }
    await sql` DELETE FROM companies WHERE company_id = ${companyId}`;

    res.status(200).json({
      message: "Company and all associated jobs have been deleted",
    });
  }
);

//Create JOB Controller

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  // 🔐 Check auth
  if (!user) {
    throw new ErrorHandler(401, "Authentication Required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Only recruiters can create companies");
  }
  const {
    title,
    description,
    salary,
    location,
    job_type,
    openings,
    role,
    work_location,
    company_id,
  } = req.body;

  // 📝 Validate required fields
  if (
    !title ||
    !description ||
    !job_type ||
    !openings ||
    !role ||
    !work_location ||
    !company_id
  ) {
    throw new ErrorHandler(400, "Missing required job fields");
  }
  const [company] = await sql`
    SELECT company_id FROM companies WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id}`;

  if (!company) {
    throw new ErrorHandler(403, "Company Not Found Or Unauthorized");
  }

  const [newJob] = await sql`
    INSERT INTO jobs (title, description, salary, location, job_type, openings, role, work_location, company_id, posted_by_recruiter_id)
    VALUES (
      ${title},
      ${description},
      ${salary},
      ${location},
      ${job_type},
      ${openings},
      ${role},
      ${work_location},
      ${company_id},
      ${user.user_id}
    )
    RETURNING *`;

  res.status(201).json({
    status: "Job Created Successfully.!",
    job: newJob,
  });
});

//Update Job Controller:-

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  const { jobId } = req.params;

  // Auth checks
  if (!user) throw new ErrorHandler(401, "Authentication Required");
  if (user.role !== "recruiter")
    throw new ErrorHandler(403, "Only recruiters can update jobs");
  if (!jobId) throw new ErrorHandler(400, "Job ID is required");

  // 1️⃣ Fetch existing job
  const [existingJob] = await sql`
    SELECT * FROM jobs WHERE job_id = ${jobId}
  `;

  if (!existingJob) throw new ErrorHandler(404, "Job not found");
  //console.log("Existing Job", existingJob);
  // Check ownership
  if (existingJob.posted_by_recruiter_id !== user.user_id) {
    throw new ErrorHandler(403, "Unauthorized to update this job");
  }

  // 2️⃣ Merge new values with old ones (fallback logic)
  const updatedFields = {
    title: req.body.title ?? existingJob.title,
    description: req.body.description ?? existingJob.description,
    salary: req.body.salary ?? existingJob.salary,
    location: req.body.location ?? existingJob.location,
    job_type: req.body.job_type ?? existingJob.job_type,
    openings: req.body.openings ?? existingJob.openings,
    role: req.body.role ?? existingJob.role,
    work_location: req.body.work_location ?? existingJob.work_location,
    company_id: req.body.company_id ?? existingJob.company_id,
    is_active: req.body.is_active ?? existingJob.is_active,
  };

  // 3️⃣ Update dynamically
  const [updatedJob] = await sql`
    UPDATE jobs SET
      title = ${updatedFields.title},
      description = ${updatedFields.description},
      salary = ${updatedFields.salary},
      location = ${updatedFields.location},
      job_type = ${updatedFields.job_type},
      openings = ${updatedFields.openings},
      role = ${updatedFields.role},
      work_location = ${updatedFields.work_location},
      company_id = ${updatedFields.company_id},
      is_active = ${updatedFields.is_active}
    WHERE job_id = ${jobId}
    RETURNING *
  `;

  res.status(200).json({
    status: "Job Updated Successfully.!",
    job: updatedJob,
  });
});

//Delete Job Controller

export const deleteJobs = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  const { jobId } = req.params;

  //Auth Check:-

  if (!user) {
    throw new ErrorHandler(401, "Authentication Required");
  }
  if (user.role !== "recruiter") {
    throw new ErrorHandler(403, "Only recruiters can delete jobs");
  }
  if (!jobId) {
    throw new ErrorHandler(400, "Job ID is required");
  }
  //Fetch Existing Job:-
  const [existingJobs] = await sql`
    SELECT * FROM jobs WHERE job_id = ${jobId}
  `;
  if (!existingJobs) {
    throw new ErrorHandler(404, "Job Not Found");
  }
  //Check OWnership:
  if (existingJobs.posted_by_recruiter_id !== user.user_id) {
    throw new ErrorHandler(403, "Unauthorized to delete this job");
  }
  //Delete Job:-
  await sql`
    DELETE FROM jobs WHERE job_id = ${jobId}
  `;
  res.status(200).json({
    status: "Job Deleted Successfully.!",
  });
});

//Get ALL Companies By Recruiters Controller:-

export const getAllCompanies = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const companies =
      await sql` SELECT * FROM companies WHERE recruiter_id = ${req.user?.user_id} `;
    res.status(200).json({
      status: "Companies Fetched Successfully.!",
      companies,
    });
  }
);

//Get Single Company Details By ID:-

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ErrorHandler(400, "Company ID is required");
    }

    // Fetch company details + jobs of that company
    const [companyData] = await sql`
    SELECT 
      c.*,
      COALESCE(
        (
          SELECT json_agg(j.*)
          FROM jobs j
          WHERE j.company_id = c.company_id
        ),
        '[]'::json
      ) AS jobs
    FROM companies c
    WHERE c.company_id = ${id};
  `;

    if (!companyData) {
      throw new ErrorHandler(404, "Company Not Found");
    }

    res.status(200).json({
      status: "success",
      company: companyData,
    });
  }
);

//Get ALL Active Jobs Controller:-

export const getAllJobs = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { title, location } = req.query as {
      title?: string;
      location?: string;
    };

    let queryString = `
      SELECT 
        j.job_id,
        j.title,
        j.description,
        j.salary,
        j.location,
        j.job_type,
        j.openings,
        j.role,
        j.work_location,
        j.is_active,
        
        j.created_at,
        c.name AS company_name,
        c.logo AS company_logo,
        c.company_id
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE 1 = 1
    `;

    const values: any[] = [];
    let paramIndex = 1;

    if (title) {
      queryString += ` AND j.title ILIKE $${paramIndex}`;
      values.push(`%${title}%`);
      paramIndex++;
    }

    if (location) {
      queryString += ` AND j.location ILIKE $${paramIndex}`;
      values.push(`%${location}%`);
      paramIndex++;
    }

    queryString += ` ORDER BY j.created_at DESC`;

    const jobs = (await sql.query(queryString, values)) as any[];

    res.status(200).json({
      status: "Jobs fetched successfully!",
      jobs,
    });
  }
);


//Get Single Job Details By ID Controller:-

export const getSingleJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const jobId = req.params.jobId;

  const [job] = await sql`
    SELECT 
      j.job_id,
      j.title,
      j.description,
      j.salary,
      j.location,
      j.job_type,
      j.openings,
      j.role,
      j.work_location,
      j.is_active,
      j.created_at,
      j.updated_at,
      j.posted_by_recruiter_id,

      c.company_id,
      c.name AS company_name,
      c.logo AS company_logo

    FROM jobs j
    JOIN companies c ON j.company_id = c.company_id
    WHERE j.job_id = ${jobId}
  `;

  if (!job) {
    return res.status(404).json({
      status: "Job not found",
    });
  }

  res.status(200).json({
    status: "Job fetched successfully!",
    job,
  });
});

// For Jobseeker - Get all applications by the user
export const getAllApplicationsForUser = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) throw new ErrorHandler(401, "Authentication Required");
    if (user.role !== "jobseeker")
      throw new ErrorHandler(403, "Only jobseekers can view their applications");

    // JOIN with jobs and companies to get complete information
    const applications = await sql`
      SELECT 
        a.application_id,
        a.job_id,
        a.applicant_id,
        a.applicant_email,
        a.status,
        a.resume,
        a.applied_at,
        a.subscribe,
        j.title as job_title,
        j.salary as job_salary,
        j.location as job_location,
        j.description as job_description,
        j.job_type,
        j.work_location,
        c.name as company_name,
        c.logo as company_logo
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.job_id
      INNER JOIN companies c ON j.company_id = c.company_id
      WHERE a.applicant_id = ${user.user_id}
      ORDER BY a.subscribe DESC, a.applied_at DESC
    `;

    res.status(200).json({
      message: "Applications Fetched Successfully",
      applications,
    });
  }
);

//Get All APplications For A Job Controller:-
export const getAllApplicationsForJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { jobId } = req.params;

    // Auth checks
    if (!user) throw new ErrorHandler(401, "Authentication Required");
    if (user.role !== "recruiter")
      throw new ErrorHandler(403, "Only recruiters can update jobs");
    if (!jobId) throw new ErrorHandler(400, "Job ID is required");

    const [job] = await sql `SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${jobId} `;

    if(!job)
    {
      throw new ErrorHandler(404, "Job Not Found");
    }
    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Unauthorized to view applications for this job");
    }
    const applications = await sql `SELECT * FROM applications WHERE job_id = ${jobId} ORDER BY subscribe DESC, applied_at ASC`;

    res.status(200).json({
      status: "Applications Fetched Successfully.!",
      applications,
    });
  }
);

//Update Application Status Controller:-

export const updateApplication = TryCatch(async (req: AuthenticatedRequest, res) => {
   const user = req.user;
    // Auth checks
    if (!user) throw new ErrorHandler(401, "Authentication Required");
    if (user.role !== "recruiter")
    {
      throw new ErrorHandler(403, "Only recruiters can update jobs");
    }
    const { applicationId } = req.params;
    const [application] = await sql `SELECT * FROM applications WHERE application_id= ${applicationId} `;
    if(!application)
    {
      throw new ErrorHandler(404, "Application Not Found");
    }
    const [job] = await sql `SELECT posted_by_recruiter_id,title FROM jobs where job_id = ${application.job_id} `;
   if(!job)
   {
    throw new ErrorHandler(404, "Job Not Found For This Application");
   }

   if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Unauthorized to update this application");
   }

   const [updatedApplication] = await sql `UPDATE applications SET status = ${req.body.status} WHERE application_id = ${applicationId} RETURNING * `;
   const message = {
    to: application.applicant_email,
    subject: `Your Application for ${job.title} - Status Update - Job portal`,
    html: applicationStatusUpdateTemplate(job.title),
   };
   publishToTopic("send-mail",message).catch((err) => {
    console.error("Failed to publish message to topic:", err);
   });

    res.status(200).json({
      status: "Application Status Updated Successfully.!",
      job,
      updatedApplication,
    });
  }
);