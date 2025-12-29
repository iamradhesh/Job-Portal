import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/user", userRoutes);

app.listen(process.env.PORT, () => {
  console.log("✅ User Service running on PORT:", process.env.PORT);
});
