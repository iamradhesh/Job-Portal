"use client";

import { CareerGuideResponse,} from "@/types";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Lightbulb,
  Loader,
  Search,
  Sparkle,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { utils_service } from "@/context/AppContext";
import toast from "react-hot-toast";

const CareerGuide = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<CareerGuideResponse | null>(null);

  //Add SKills
  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };
  //Remove Skills
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addSkill();
    }
  };

  const getCarrerGuidence = async () => {
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/career`, {
        skills: skills,
      });

      setResponse(data);
      toast.success("career Guidence Generated");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setSkills([]);
    setCurrentSkill("");
    setResponse(null);
    setOpen(false);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 ">
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border 
        bg-blue-50 dark:bg-blue-950 mb-4"
        >
          <Sparkles size={16} className="text-blue-600" />
          <span className="text-sm font-medium">
            AI-Powered Career Guidence
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Discover Your Career Path
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
          Get Personalized Job Recomendations and Lerning Roadmaps Based On Your
          Skills.
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size={"lg"} className="gap-2 h-12 px-8">
              <Sparkles size={18} />
              Get Carrer Guidence
              <ArrowRight size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {!response ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="text-blue-600" />
                    Tell us about Your Skills
                  </DialogTitle>
                  <DialogDescription>
                    Add Your Technical Skills to Recieve Personalized Carrer
                    Recommendations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill">Add Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skill"
                        placeholder="e.g., React , Node.js , python..."
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        className="h-11"
                        onKeyPress={handleKeyPress}
                      />
                      <Button
                        onClick={addSkill}
                        className="gap-2 mt-1 flex items-center justify-center "
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  {skills.length > 0 && (
                    <div className="space-y-2">
                      <Label>Your Skills ({skills.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <div
                            key={s}
                            className="inline-flex items-center gap-2
                                            pl-3 pr-2 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30
                                            border border-blue-200 dark:border-blue-800"
                          >
                            <span className="text-sm  font-medium">{s}</span>
                            <Button
                              variant={"destructive"}
                              className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                              onClick={() => removeSkill(s)}
                            >
                              <X size={13} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    className="w-full h-11 gap-2"
                    disabled={loading || skills.length === 0}
                    onClick={getCarrerGuidence}
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Analyzing Your Skills
                      </>
                    ) : (
                      <>
                        <Sparkles
                          size={18}
                          className={`${
                            skills.length !== 0 ? "animate-pulse" : ""
                          }`}
                        />
                        Generate Carrer Guidence
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    <Target className="text-blue-600" />
                    Your Personalized Carrer Guide
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Summary */}
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Lightbulb
                        className="text-blue-600 mt-1 shrink-0"
                        size={20}
                      />
                      <div className="">
                        <h3 className="font-semibold mb-2">Carrer Summary</h3>
                        <p className="text-sm leading-relaxed opacity-90">
                          {response.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Job Options */}
                  <div className="">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Briefcase size={20} className="text-blue-600" />
                      Recommended Carrer Paths
                    </h3>
                    <div className="space-y-3">
                      {response.jobOptions.map((job, index) => (
                        <div
                          className="p-4 rounded-lg boder hover:border-blue-500 transition-colors"
                          key={index}
                        >
                          <h4 className="font-semibold text-base mb-2">
                            {job.title}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium opacity-70">
                                Responsibilities:
                              </span>
                              <span className="opacity-80">
                                {job.responsibilities}
                              </span>
                            </div>
                            <span className="font-medium opacity-70">
                              Why This Role:
                            </span>
                            <span className="opacity-80">{job.why}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Skills To Learn */}
                  <div className="">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp size={20} className="text-blue-600" />
                      Skills to Enhance Your Carrer:
                    </h3>
                    <div className="space-y-4">
                      {response.skillsToLearn.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-semibold text-sm text-blue-600">
                            {category.category}
                          </h4>

                          <div className="space-y-2">
                            {category.skills.map((skill, sindex) => (
                              <div
                                key={sindex}
                                className="p-3 rounded-lg bg-secondary border text-sm"
                              >
                                <p className="font-medium mb-1">
                                  {skill.title}
                                </p>
                                <p className="text-xs opacity-70 mb-1">
                                    <span className="font-medium">Why:</span>
                                    {
                                        skill.why
                                    }
                                </p>
                                <p className="text-xs opacity-70 mb-1">
                                    <span className="font-medium">How:</span>
                                    {
                                        skill.how
                                    }
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Learning Approach */}
                  <div className="p-4 rounded-lg border bg-blue-950/20 dark:bg-red-950/20">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <BookOpen size={20} className="text-blue-600" />
                        {response.learningApproach.title}
                      </h3>
                      <ul className="space-y-2">
                        {
                            response.learningApproach.points.map((point,index)=>(
                                <li className="text-sm flex items-center" key={index}>
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span className="opacity-90" dangerouslySetInnerHTML={{__html:point}}/>
                                </li>
                            ))
                        }
                      </ul>
                  </div>
                  <Button variant={"outline"} onClick={resetDialog} className="w-full">
                    <Search size={13} />
                    Start New Analysis
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CareerGuide;
