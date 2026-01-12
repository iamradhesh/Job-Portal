"use client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useAppData } from "@/context/AppContext";
import { AccountProps } from "@/types";
import { Award, Plus, Sparkles, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Skills: React.FC<AccountProps> = ({ user, isYourAccount }) => {
  const [skill, setSkill] = useState("");
  const { addSkill, btnLoading, removeSkill } = useAppData();

  const addSkillHandler = () => {
    if (!skill.trim()) {
      toast.error("Please Enter A Skill ");
      return;
    }
    addSkill(skill, setSkill);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addSkillHandler();
    }
  };

  const removeSkillHandler = (skillToRemove: string) => {
    if (confirm(`Are You Sure You Want to Remove ${skill} from your skills?`)) {
      removeSkill(skillToRemove);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 ">
      <Card className="shadow-lg border-2 overflow-hidden">
        <div className="bg-blue-500 p-6 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900
                flex items-center justify-center"
            >
              <Award size={20} className="text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-white">
              {isYourAccount ? "Your Skills" : "User Skills"}
            </CardTitle>
            <br />
            {isYourAccount && (
              <CardDescription className="text-sm mt-1 text-white">
                Showcase Your Expertise and abilities
              </CardDescription>
            )}
          </div>
        </div>
        {/* Add Skill Input */}
        {isYourAccount && (
          <div className="flex gap-3 flex-col ml-1 sm:flex-row">
            <div className="relative flex-1">
              <Sparkles
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />
              <Input
                type="text"
                placeholder="e.g; React , Node.js,Python"
                className="h-11 pl-10 bg-background"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              type="button"
              onClick={addSkillHandler}
              className="h-11 gap-2 px-6 pr-2 mr-2 hover:cursor-pointer"
              disabled={!skill.trim() || btnLoading}
            >
              <Plus size={18} /> Add Skills
            </Button>
          </div>
        )}
        {/* Skills Display */}
        <CardContent className="p-6">
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.skills.map((ele, index) => (
                <div
                  className="group relative inline-flex items-center gap-2  border-2 rounded-full hover:shadow-sm duration-200 transition-all pl-4 pr-3 py-2"
                  key={index}
                >
                  <span className="font-medium text-sm">{ele}</span>
                  {isYourAccount && (
                    <Button
                      onClick={() => removeSkillHandler(ele)}
                      className="h-6 w-6 rounded-full text-red-500 flex items-center justify-center hover:bg-gray-600 hover:scale-110"
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <Award size={32} className="opacity-40" />
                </div>
                <CardDescription className="text-center max-w-md mx-auto">
                  {
                    isYourAccount
                      ? "You have not added any skills yet. Start showcasing your expertise by adding your skills!"
                      : "This user has not added any skills yet."
                  }
                </CardDescription>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Skills;
