import express from "express";
import dotenv from "dotenv";
import router from "./routes.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { startSendMailConsumer } from "./consumer.js";
dotenv.config();



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
startSendMailConsumer();
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/utils", router);

app.listen(process.env.PORT, () => {
  console.log("✅ Utility service is running on port", process.env.PORT);
});
