"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import {
  Upload,
  CheckCircle2,
  Loader2,
  ArrowRight,
  FileCheck,
  Zap,
  AlertTriangle,
  Info,
  Layers,
  Search,
  Layout,
  BookOpen,
  Sparkles,
  Target,
  TrendingUp,
  X,
  AlertCircle,
  Lightbulb,
  ChevronRight
} from "lucide-react";
import { ResumeAnalysisResponse } from "@/types";
import { utils_service } from "@/context/AppContext";
import toast from "react-hot-toast";

// Updated Types based on new schema
// interface ScoreItem {
//   score: number;
//   feedback: string;
// }

// interface Suggestion {
//   category: string;
//   issue: string;
//   recommendation: string;
//   priority: "high" | "medium" | "low";
// }

// interface AreaOfImprovement {
//   area: string;
//   description: string;
//   impact: string;
// }

// interface ResumeAnalysisResponse {
//   atsScore: number;
//   scoreBreakdown: {
//     formatting: ScoreItem;
//     keywords: ScoreItem;
//     structure: ScoreItem;
//     readability: ScoreItem;
//   };
//   suggestions: Suggestion[];
//   areasOfImprovement: AreaOfImprovement[];
//   overallPriority: "high" | "medium" | "low";
//   strengths: string[];
//   summary: string;
// }

const ResumeAnalyzer = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResumeAnalysisResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900";
      case "medium": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900";
      default: return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle size={16} className="text-red-600" />;
      case "medium": return <AlertTriangle size={16} className="text-amber-600" />;
      default: return <Info size={16} className="text-blue-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (loading) return;
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || selectedFile.type !== "application/pdf") {
      toast.error("Please upload a PDF File.!");
      return;
    };
    if(selectedFile.size > 5*1024*1024)
    {
      toast.error("FIle size Should be less than 5MB");
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const analyzeResume = async () => {
    if (!file) 
      {
        toast.error("Please upload a resume");
        return;
      };
    setLoading(true);
    setError(null);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        try {
          const apiEndpoint = `${utils_service || ''}/api/utils/resume-analyser`;
          
          const res = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pdfBase64: base64 })
          });
          
          if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
            toast.error(`API Error: ${res.status} ${res.statusText}`)
          }
          
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API did not return JSON. Check your endpoint URL.');
          }
          
          const data: ResumeAnalysisResponse = await res.json();
          setResponse(data);
          toast.success("Resume Analyzed Successfully");
        } catch (error) {
          console.error('API Error:', error);
          setError(error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.');
          toast.error(error instanceof Error ? error.message : 'Failed to analyze resume. Please try again.')
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
        setLoading(false);
      };
    } catch (error) {
      console.error('File reading error:', error);
      setError('Failed to process file. Please try again.');
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setResponse(null);
    setError(null);
    setOpen(false);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="text-center space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm">
          <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
          <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
            AI-Powered ATS Scanner
          </span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight px-2">
            Optimize Your Resume for
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 dark:from-blue-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              Maximum Impact
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
            Get instant AI-driven insights on your resume&#39;s ATS compatibility, formatting, and content quality. Stand out to recruiters and land more interviews.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-2 sm:pt-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Target size={14} className="text-green-600 shrink-0" />
            <span><strong className="text-foreground">95%</strong> ATS Pass Rate</span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <TrendingUp size={14} className="text-blue-600 shrink-0" />
            <span><strong className="text-foreground">2x</strong> Interview Rate</span>
          </div>
        </div>

        <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className="mt-6 sm:mt-8 h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <FileCheck className="mr-2" size={18} />
              Analyze My Resume
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
            {!response ? (
              <div className="p-4 sm:p-6 md:p-8 lg:p-12">
                <DialogHeader className="items-center text-center mb-6 sm:mb-8 lg:mb-10 space-y-2 sm:space-y-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <Zap className="text-white" size={24} />
                  </div>
                  <DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                    Resume Analysis
                  </DialogTitle>
                  <DialogDescription className="text-sm sm:text-base px-2">
                    Upload your PDF resume to get detailed ATS compatibility insights
                  </DialogDescription>
                </DialogHeader>

                <div 
                  onClick={() => !loading && fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 text-center transition-all duration-300 
                    ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5'}
                    ${dragActive ? 'border-violet-500 bg-violet-500/10 scale-105' : 'border-muted-foreground/20'}
                    ${file ? 'border-green-500/50 bg-green-500/5' : ''}`}
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-all duration-300
                    ${file ? 'bg-green-500/20' : 'bg-gradient-to-br from-blue-500/20 to-violet-500/20'}`}>
                    {file ? (
                      <CheckCircle2 className="text-green-600" size={32} />
                    ) : (
                      <Upload className="text-violet-600" size={32} />
                    )}
                  </div>
                  
                  {file ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2">
                        <p className="text-base sm:text-lg lg:text-xl font-semibold text-foreground break-all max-w-full">
                          {file.name}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-950 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                        >
                          <X size={14} className="text-red-600" />
                        </Button>
                      </div>
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                        Ready to analyze
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-base sm:text-lg lg:text-xl font-semibold text-foreground px-2">
                        Drop your resume here or click to browse
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        PDF files only • Max 5MB
                      </p>
                    </div>
                  )}
                  
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    accept=".pdf" 
                    onChange={handleFileSelect} 
                    disabled={loading} 
                  />
                </div>

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                <Button 
                  onClick={analyzeResume} 
                  disabled={!file || loading} 
                  className="w-full mt-6 sm:mt-8 h-14 sm:h-16 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 sm:mr-3" size={20} />
                      <span>Analyzing Resume...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 sm:mr-3" size={20} />
                      <span>Start Analysis</span>
                    </>
                  )}
                </Button>

                <div className="mt-6 sm:mt-8 flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-muted/50 border">
                  <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your resume is analyzed using advanced AI to check ATS compatibility, keyword optimization, formatting quality, and overall readability. Results are typically generated in 10-15 seconds.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Header with Score and Priority */}
                <div className="sticky top-0 z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 md:p-8 lg:p-10 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                        <FileCheck size={14} />
                        <span>Analysis Complete</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Resume Report</h2>
                      <Badge className={`${getPriorityColor(response.overallPriority)} mt-2`}>
                        {response.overallPriority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="text-center">
                        <div className={`text-5xl sm:text-6xl lg:text-7xl font-black ${getScoreColor(response.atsScore)}`}>
                          {response.atsScore}
                        </div>
                        <div className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-400 mt-1">
                          ATS Score
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-8 sm:space-y-10 lg:space-y-12 bg-gradient-to-b from-background to-muted/20">
                  {/* Executive Summary */}
                  <section className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Info size={16} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold">Executive Summary</h3>
                    </div>
                    <div className="relative p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 text-4xl sm:text-5xl lg:text-6xl text-blue-200 dark:text-blue-900/50 font-serif">&quot;</div>
                      <p className="relative text-sm sm:text-base lg:text-lg leading-relaxed text-foreground/90 italic pl-6 sm:pl-8">
                        {response.summary}
                      </p>
                    </div>
                  </section>

                  {/* Score Breakdown */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Target size={16} className="text-violet-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold">Performance Metrics</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {[
                        { label: "Formatting", data: response.scoreBreakdown.formatting, icon: <Layout size={18}/>, color: "blue" },
                        { label: "Keywords", data: response.scoreBreakdown.keywords, icon: <Search size={18}/>, color: "green" },
                        { label: "Structure", data: response.scoreBreakdown.structure, icon: <Layers size={18}/>, color: "violet" },
                        { label: "Readability", data: response.scoreBreakdown.readability, icon: <BookOpen size={18}/>, color: "amber" },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border hover:shadow-lg transition-all duration-300 space-y-3 sm:space-y-4">
                          <div className="flex justify-between items-center gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-${item.color}-500/10 flex items-center justify-center shrink-0`}>
                                {item.icon}
                              </div>
                              <span className="font-semibold text-base sm:text-lg truncate">{item.label}</span>
                            </div>
                            <span className={`text-xl sm:text-2xl font-bold ${getScoreColor(item.data.score)} shrink-0`}>
                              {item.data.score}%
                            </span>
                          </div>
                          <Progress value={item.data.score} className="h-2 sm:h-3 rounded-full" />
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {item.data.feedback}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Actionable Suggestions */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Lightbulb size={16} className="text-amber-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold">Actionable Suggestions</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      {response.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border bg-card hover:shadow-lg transition-all duration-300 space-y-3 sm:space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3">
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(suggestion.priority)}
                              <Badge variant="outline" className={`${getPriorityColor(suggestion.priority)} font-semibold text-xs`}>
                                {suggestion.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold uppercase text-muted-foreground tracking-wider">
                              {suggestion.category}
                            </span>
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5 sm:mt-1" />
                              <p className="text-xs sm:text-sm font-semibold text-foreground">
                                {suggestion.issue}
                              </p>
                            </div>
                            <div className="flex items-start gap-2 pl-4 sm:pl-6">
                              <ChevronRight size={14} className="text-green-600 shrink-0 mt-0.5 sm:mt-1" />
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {suggestion.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Areas of Improvement */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp size={16} className="text-orange-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold">Areas of Improvement</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {response.areasOfImprovement.map((area, idx) => (
                        <div key={idx} className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-900/50 hover:shadow-lg transition-all duration-300 space-y-3">
                          <h4 className="font-bold text-base sm:text-lg text-orange-900 dark:text-orange-300">
                            {area.area}
                          </h4>
                          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                            {area.description}
                          </p>
                          <div className="pt-2 border-t border-orange-200 dark:border-orange-900/50">
                            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 flex items-start gap-2">
                              <Info size={14} className="shrink-0 mt-0.5" />
                              <span>Impact: {area.impact}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Strengths */}
                  <section className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-green-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                        Key Strengths
                      </h3>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      {response.strengths.map((s, i) => (
                        <div key={i} className="group flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 hover:shadow-md transition-all duration-300">
                          <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 shrink-0 mt-1.5 sm:mt-2" />
                          <span className="text-xs sm:text-sm leading-relaxed text-foreground/90">{s}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Action Button */}
                  <div className="pt-4 sm:pt-6">
                    <Button 
                      onClick={resetDialog} 
                      variant="outline" 
                      className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold hover:bg-accent transition-all duration-300"
                    >
                      Analyze Another Resume
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;