import { TryCatch } from "../utils/TryCatch.js";
import dotenv from "dotenv";
dotenv.config();
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from "bcrypt";
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import  { forgotPasswordTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../index.js";

export const registerUser = TryCatch(async (req, res, next) => {
  const { name, email, password, phoneNumber, role, bio } = req.body; // ✅ FIXED

  if (!name || !email || !password || !phoneNumber || !role) {
    throw new ErrorHandler(400, "All fields are required except bio");
  }

  // Check existing user
  const existingUsers =
    await sql`SELECT user_id FROM users WHERE email = ${email}`;

  if (existingUsers.length > 0) {
    throw new ErrorHandler(409, "User already exists. Please login!");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  let registerdUser: any;

  // --------------- Recruiter ---------------
  if (role === "recruiter") {
    const [user] = await sql`
        INSERT INTO users (name, email, password, phone_number, role)
        VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role})
        RETURNING user_id, name, email, phone_number, role, created_at
      `;

    registerdUser = user;
  }

  // --------------- Jobseeker ---------------
  else if (role === "jobseeker") {
    if (!req.file) {
      throw new ErrorHandler(400, "Resume is required for jobseekers");
    }

    const fileBuffer = getBuffer(req.file);

    if (!fileBuffer) {
      throw new ErrorHandler(500, "Failed to get resume buffer");
    }

    console.log("📤 Sending to upload service...");
    console.log("Filename:", req.file.originalname);

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      {
        dataURI: fileBuffer.content,
        filename: req.file.originalname, // ✅ Send filename too
      }
    );

    console.log("📥 Upload response:", data);

    const [user] = await sql`
    INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id)
    VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id})
    RETURNING user_id, name, email, phone_number, role, bio, resume, resume_public_id, created_at
  `;

    registerdUser = user;
  }
  const token = jwt.sign(
    { id: registerdUser.user_id, role: registerdUser.role },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15d",
    }
  );
  // Response
  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: registerdUser,
    token,
  });
});

//Login user:-
export const loginUser = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler(400, "Email and password are required");
  }
  const user = await sql`
    SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.resume, u.resume_public_id,u.profile_pic,u.subscription,
    ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id
    LEFT JOIN skills s ON us.skill_id = s.skill_id
    WHERE u.email = ${email}
    GROUP BY u.user_id
  `;
  if (user.length === 0) {
    throw new ErrorHandler(401, "Invalid Credentials");
  }

  const userObject = user[0] as any;
  const isPasswordValid = await bcrypt.compare(password, userObject.password);

  if (!isPasswordValid) {
    throw new ErrorHandler(401, "Invalid Credentials");
  }
  userObject.skills = userObject.skills || [];
  delete userObject.password;

  const token = jwt.sign(
    { id: userObject.user_id, role: userObject.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "15d" }
  );

  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    data: userObject,
    token,
  });
});

//Forgot Password

export const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;
  console.log("Received body:", req.body);
  if (!email) {
    throw new ErrorHandler(400, "email is required");
  }
  const users =
    await sql`SELECT user_id,email FROM users WHERE email =${email}`;
  if (users.length == 0) {
    return res.json({
      message: "if that email exists , we have sent a reset link",
    });
  }
  const user :any = users[0];

  const resetToken = jwt.sign(
    {
      email: user.email,
      type: "reset",
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15m",
    }
  );
  const resetLink = `${process.env.FRONTEND_URL}/reset/${resetToken}`
  await redisClient.set(`forgot :${email}`,resetToken,{
    EX:900,
  })
  const message = {
    to:email,
    subject:"RESET Your Password - hirehub",
    html: forgotPasswordTemplate(resetLink),

  };

  publishToTopic("send-mail",message).catch((error)=>{
      console.log("Failed to send message",error);
  });

  res.json({
    message: "if that email exists , we have sent a reset link",
  })
});
