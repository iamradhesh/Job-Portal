import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.API_KEY_GEMINI;

if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

export default ai;
