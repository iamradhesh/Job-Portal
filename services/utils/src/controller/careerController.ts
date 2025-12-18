import type { Request, Response } from "express";
import { buildCareerPrompt } from "../prompts/career.prompt.js";
import { generateTextContent } from "../services/genaiService.js";
import { parseJsonResponse } from "../parsers/jsonParser.js";

export const generateCareerAdvice = async (req: Request, res: Response) => {
  let rawResponse: string | null = null;

  try {
    const { skills } = req.body;

    if (!skills) {
      return res.status(400).json({ message: "Skills are required" });
    }

    const prompt = buildCareerPrompt(skills);

    rawResponse = await generateTextContent(prompt); // 👈 capture raw text here

    const parsed = parseJsonResponse(rawResponse);

    return res.status(200).json(parsed);

  } catch (error: any) {
    console.error("❌ AI Controller Error:", error.message);

    return res.status(500).json({
      message: "Failed to generate or parse AI response",
      rawResponse, // 👈 safely available here
    });
  }
};
