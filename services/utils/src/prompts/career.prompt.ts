export const buildCareerPrompt = (skills: string): string => `
Based on the following skills: ${skills}.
Please act as a career advisor and generate a career path suggestion.

Your entire response must be in a valid JSON format.
Do not include any text or markdown formatting outside of the JSON structure.

{
  "summary": "...",
  "jobOptions": [
    {
      "title": "...",
      "responsibilities": "...",
      "why": "..."
    }
  ],
  "skillsToLearn": [
    {
      "category": "...",
      "skills": [
        {
          "title": "...",
          "why": "...",
          "how": "..."
        }
      ]
    }
  ],
  "learningApproach": {
    "title": "...",
    "points": ["..."]
  }
}
`;
