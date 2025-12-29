import { ReactNode } from "react";

export interface JobOptions {
  title: string;
  responsibilities: string;
  why: string;
}

export interface SkillsToLearn {
  title: string;
  why: string;
  how: string;
}

export interface skillCategory {
  category: string;
  skills: SkillsToLearn[];
}

export interface LearningApproach {
  title: string;
  points: string[];
}

export interface CareerGuideResponse {
  summary: string;
  jobOptions: JobOptions[];
  skillsToLearn: skillCategory[];
  learningApproach: LearningApproach;
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
  suggestions: Suggestion[]; // 🔥 FIXED
  areasOfImprovement: AreaOfImprovement[]; // 🔥 NEW
  overallPriority: "high" | "medium" | "low"; // 🔥 NEW
  strengths: string[];
  summary: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: "jobseeker" | "recruiter";
  bio: string | null;
  resume: string | null;
  resume_public_id: string | null;
  profle_pic: string | null;
  profile_pic_public_id: string | null;
  skills: string[];
  subscription: string | null;
}

export interface AppContextTypes {
  user: User | null;
  loading: boolean;
  btnLoading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setBtnLoading: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: ()=> Promise<void>
}

export interface AppProviderProps {
  children: ReactNode;
}
