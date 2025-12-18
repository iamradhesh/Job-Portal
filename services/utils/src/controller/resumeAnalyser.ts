import type { Request, Response } from "express";
import { buildResumeAnalyserPrompt } from "../prompts/resumeAnalyser.prompt.js";
import { generatePdfContent } from "../services/genaiService.js";
import { parseJsonResponse } from "../parsers/jsonParser.js";

export const analyseResume = async (req: Request, res: Response) => {
  let rawResponse: string | null = null;

  try {
    const { pdfBase64 } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({
        message: "pdfBase64 is required",
      });
    }

    const prompt = buildResumeAnalyserPrompt(pdfBase64);

    // 👇 capture raw AI response
    rawResponse = await generatePdfContent(prompt, pdfBase64);

    const parsed = parseJsonResponse(rawResponse);

    if (!parsed) {
      return res.status(500).json({
        message: "Failed to parse AI response",
        rawResponse, // 👈 very helpful for other devs
      });
    }

    return res.status(200).json(parsed);

  } catch (error: any) {
    console.error("❌ Resume Analyser Error:", error.message);

    return res.status(500).json({
      message: "Failed to analyze resume",
      rawResponse, // 👈 always return raw AI output on error
    });
  }
};
