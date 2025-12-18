export const parseJsonResponse = (text: string) => {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    if (!cleaned) {
      throw new Error("Empty AI output");
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("❌ JSON Parsing Error:", error);
    throw new Error("AI returned invalid JSON");
    
  }
};
