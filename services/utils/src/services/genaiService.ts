import ai from "../config/genai.config.js";

/**
 * For text-only prompts (career advice, etc.)
 */
export const generateTextContent = async (
  prompt: string
): Promise<string> => {
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
    console.error("❌ AI Text Service Error:", error);
    throw error;
  }
};

/**
 * For PDF / inline data (resume analyser)
 */
export const generatePdfContent = async (
  prompt: string,
  pdfBase64: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
              },
            },
          ],
        },
      ],
    });

    if (!response.text) {
      throw new Error("Empty AI response");
    }

    return response.text;
  } catch (error) {
    console.error("❌ AI PDF Service Error:", error);
    throw error;
  }
};
