export interface JobOptions{
    title:string,
    responsibilities:string,
    why:string
}

export interface SkillsToLearn{
    title:string;
    why:string;
    how:string;
}

export interface skillCategory{
    category:string;
    skills:SkillsToLearn[];
}

export interface LearningApproach{
    title:string;
    points:string[];

}

export interface CareerGuideResponse{
    summary:string;
    jobOptions:JobOptions[];
    skillsToLearn:skillCategory[];
    learningApproach:LearningApproach;
}

export interface ScoreItem {
  score: number;
  feedback: string;
}

export interface Suggestion {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}

export interface AreaOfImprovement {
  area: string;
  description: string;
  impact: string;
}

export interface ResumeAnalysisResponse {
  atsScore: number;
  scoreBreakdown: {
    formatting: ScoreItem;
    keywords: ScoreItem;
    structure: ScoreItem;
    readability: ScoreItem;
  };
  suggestions: Suggestion[];              // 🔥 FIXED
  areasOfImprovement: AreaOfImprovement[]; // 🔥 NEW
  overallPriority: "high" | "medium" | "low"; // 🔥 NEW
  strengths: string[];
  summary: string;
}

export const utils_service = "http://localhost:5001"