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

export const utils_service = "http://localhost:5001"