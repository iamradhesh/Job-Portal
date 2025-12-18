import ai from "../config/genai.config.js";

export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  if (!response.text) {
    throw new Error("Empty AI response");
  }

  return response.text;
  } catch (error) {
    console.error("❌ AI Service Error:", error);
    throw new Error("Failed to generate AI content");
  }
};
