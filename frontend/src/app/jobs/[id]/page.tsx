"use client";

import Loading from "@/app/components/loading";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/components/ui/card";
import { job_service, useAppData } from "@/context/AppContext";
import { Application, Job } from "@/types";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Users,
  Clock,
  Home,
  CheckCircle2,
  Calendar,
  Filter,
  FileText,
  User,
  XCircle,
  UserCheck,
  Send,
  Edit,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Link from "next/link";

const JobPage = () => {
  const params = useParams();
  const id = params?.id ? Number(params.id) : 0;

  const { user, applyJob, applications, btnLoading } = useAppData();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("token");
  const [value, setValue] = useState("");

  const isApplied = useMemo(() => {
    if (!applications || !id) return false;
    return applications.some((item: Application) => item.job_id === id);
  }, [applications, id]);

  const [applied, setApplied] = useState(isApplied);

  useEffect(() => {
    setApplied(isApplied);
  }, [isApplied]);

  const applyJobHandler = (id: number) => {
    if (id) {
      applyJob(id);
      setApplied(true);
    }
  };

  async function fetchSingleJob() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/${id}`);
      setJob(data.job);
    } catch (error) {
      console.log("Error While fetching Job By Id:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleJob();
  }, [id]);

  const formatSalary = (salary: number | null) => {
    if (salary === null || salary === undefined) return "Not specified";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const [jobApplications, setJobApplications] = useState<Application[]>([]);

  async function fetchJobApplications() {
    try {
      const { data } = await axios.get(
        `${job_service}/api/job/application/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobApplications(data.applications);
    } catch (error) {
      console.log(error);
    }
  }

  async function updateApplicationHandler(applicationId: number) {
    if (value === "") {
      return toast.error("Please select a valid status");
    }
    try {
      const { data } = await axios.put(
        `${job_service}/api/job/application/update/${applicationId}`,
        { status: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      setValue(""); // Reset the select after successful update
      fetchJobApplications(); // Refresh the applications list
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unexpected error occurred");
      }
    }
  }

  useEffect(() => {
    if (user && job && user.user_id === job.posted_by_recruiter_id) {
      fetchJobApplications();
    }
  }, [user, job]);

  const [filterStatus, setFilterStatus] = useState("All");

  const filterApplications =
    filterStatus === "All"
      ? jobApplications
      : jobApplications.filter((app) => app.status === filterStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hired":
        return <UserCheck size={16} />;
      case "Rejected":
        return <XCircle size={16} />;
      default:
        return <Send size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hired":
        return "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20";
      case "Rejected":
        return "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-950">
      {loading ? (
        <Loading />
      ) : (
        <>
          {job && (
            <>
              {/* Sticky Header */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                  <Button
                    variant="ghost"
                    className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft size={18} />
                    <span className="font-medium hidden sm:inline">Back to Jobs</span>
                    <span className="font-medium sm:hidden">Back</span>
                  </Button>
                </div>
              </div>

              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                {/* Hero Card */}
                <Card className="overflow-hidden shadow-2xl mb-8 border-0 bg-white dark:bg-gray-900">
                  {/* Header Section with Gradient */}
                  <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 md:p-10">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>
                    
                    <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                              job.is_active
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            {job.is_active ? "Open Position" : "Closed"}
                          </span>
                          {job.openings && job.openings > 0 && (
                            <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/30">
                              {job.openings} Opening{job.openings > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {/* Job Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                          {job.title}
                        </h1>

                        {/* Company Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-2 text-white/95">
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                              <Building2 size={18} />
                            </div>
                            <span className="text-base sm:text-lg font-semibold">
                              {job.company_name}
                            </span>
                          </div>

                          {/* Posted Date */}
                          {job.created_at && (
                            <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                              <Calendar size={14} />
                              <span>Posted {formatDate(job.created_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Apply Button */}
                      {user && user.role === "jobseeker" && (
                        <div className="shrink-0 w-full lg:w-auto">
                          {applied ? (
                            <div className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 font-bold shadow-lg w-full lg:w-auto">
                              <CheckCircle2 size={20} />
                              <span>Already Applied</span>
                            </div>
                          ) : (
                            job.is_active && (
                              <Button
                                onClick={() => applyJobHandler(job.job_id)}
                                disabled={btnLoading}
                                className="w-full lg:w-auto px-8 py-6 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-2xl shadow-2xl hover:shadow-blue-200/50 hover:scale-105 text-base gap-2 transition-all duration-200"
                              >
                                {btnLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-700 border-t-transparent"></div>
                                    <span>Applying...</span>
                                  </>
                                ) : (
                                  <>
                                    <Briefcase size={20} />
                                    <span>Apply Now</span>
                                  </>
                                )}
                              </Button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-950/20 border-b dark:border-gray-800">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl shrink-0">
                        <DollarSign
                          size={20}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
                          Salary
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {formatSalary(job.salary)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">per annum</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl shrink-0">
                        <MapPin
                          size={20}
                          className="text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
                          Location
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {job.location || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl shrink-0">
                        <Clock
                          size={20}
                          className="text-green-600 dark:text-green-400"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
                          Job Type
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {job.job_type || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl shrink-0">
                        <Home
                          size={20}
                          className="text-orange-600 dark:text-orange-400"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">
                          Work Mode
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {job.work_location || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="p-6 md:p-10 space-y-8">
                    {/* Role Section */}
                    {job.role && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Briefcase
                              size={20}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Role
                          </h2>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg font-medium bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 px-6 py-4 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                          {job.role}
                        </p>
                      </div>
                    )}

                    {/* Description Section */}
                    {job.description && (
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FileText
                              size={20}
                              className="text-purple-600 dark:text-purple-400"
                            />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Job Description
                          </h2>
                        </div>
                        <div className="prose max-w-none dark:prose-invert prose-sm sm:prose-base">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {job.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Applications Section - Only for Recruiter */}
                {user && job && user.user_id === job.posted_by_recruiter_id && (
                  <Card className="mb-8 shadow-xl border-0 overflow-hidden bg-white dark:bg-gray-900">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Users size={24} className="text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">
                              Applications
                            </h2>
                            <p className="text-white/80 text-sm">
                              {jobApplications.length} total applicants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Filter size={16} className="text-white/80" />
                          <select
                            id="filter-status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border-0 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium focus:ring-2 focus:ring-white/50 outline-none appearance-none cursor-pointer"
                          >
                            <option value="All" className="bg-gray-800">All Status</option>
                            <option value="Submitted" className="bg-gray-800">Submitted</option>
                            <option value="Hired" className="bg-gray-800">Hired</option>
                            <option value="Rejected" className="bg-gray-800">Rejected</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      {jobApplications && jobApplications.length > 0 ? (
                        <div className="grid gap-5">
                          {filterApplications.map((app) => (
                            <div
                              className="group p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-200"
                              key={app.application_id}
                            >
                              {/* Status Badge */}
                              <div className="flex items-center justify-between mb-5">
                                <span
                                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm ${getStatusColor(
                                    app.status
                                  )}`}
                                >
                                  {getStatusIcon(app.status)}
                                  {app.status}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                  ID: #{app.application_id}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                <Link
                                  target="_blank"
                                  href={app.resume}
                                  className="group/btn inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 text-blue-700 dark:text-blue-400 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/40 dark:hover:to-blue-800/40 font-semibold text-sm transition-all duration-200 border-2 border-blue-200 dark:border-blue-900 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md"
                                >
                                  <FileText size={18} className="group-hover/btn:scale-110 transition-transform" />
                                  <span>View Resume</span>
                                </Link>

                                <Link
                                  target="_blank"
                                  href={`/account/${app.applicant_id}`}
                                  className="group/btn inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 text-purple-700 dark:text-purple-400 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/40 dark:hover:to-purple-800/40 font-semibold text-sm transition-all duration-200 border-2 border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-md"
                                >
                                  <User size={18} className="group-hover/btn:scale-110 transition-transform" />
                                  <span>View Profile</span>
                                </Link>
                              </div>

                              {/* Update Status Section */}
                              <div className="pt-5 border-t-2 border-gray-200 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <Edit size={16} className="text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Update Application Status
                                  </h4>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <div className="flex-1">
                                    <select
                                      value={value}
                                      onChange={(e) => setValue(e.target.value)}
                                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium text-sm focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 outline-none transition-all cursor-pointer hover:border-gray-400 dark:hover:border-gray-600"
                                    >
                                      <option value="" className="text-gray-500">
                                        Select new status...
                                      </option>
                                      <option value="Submitted">📝 Submitted</option>
                                      <option value="Hired">✅ Hired</option>
                                      <option value="Rejected">❌ Rejected</option>
                                    </select>
                                  </div>
                                  <Button
                                    disabled={btnLoading || !value}
                                    onClick={() => updateApplicationHandler(app.application_id)}
                                    className="sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 text-sm"
                                  >
                                    {btnLoading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Updating...</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 size={18} />
                                        <span>Update Status</span>
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <Users
                              size={40}
                              className="text-gray-400 dark:text-gray-600"
                            />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No applications yet
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Applications will appear here once candidates apply
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

              {/* Additional Info Card */}
                <Card className="shadow-xl p-6 md:p-8 bg-white dark:bg-gray-900 border-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <FileText size={20} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    Additional Information
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center py-4 border-b dark:border-gray-800">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                        Job ID
                      </span>
                      <span className="text-gray-900 dark:text-gray-100 font-bold">
                        #{job.job_id}
                      </span>
                    </div>
                    {job.company_id && (
                      <div className="flex justify-between items-center py-4 border-b dark:border-gray-800">
                        <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                          Company ID
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-bold">
                          #{job.company_id}
                        </span>
                      </div>
                    )}
                    {job.posted_by_recruiter_id && (
                      <div className="flex justify-between items-center py-4 border-b dark:border-gray-800">
                        <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                          Posted By Recruiter
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-bold">
                          #{job.posted_by_recruiter_id}
                        </span>
                      </div>
                    )}
                    {job.updated_at && (
                      <div className="flex justify-between items-center py-4">
                        <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                          Last Updated
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-bold">
                          {formatDate(job.updated_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* CTA Section for Job Seekers */}
                {user &&
                  user.role === "jobseeker" &&
                  !applied &&
                  job.is_active && (
                    <Card className="mt-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 border-0 shadow-2xl p-8 md:p-12 text-center overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>
                      
                      <div className="relative">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                          Ready to Join?
                        </h3>
                        <p className="text-white/90 mb-8 text-sm sm:text-base max-w-md mx-auto">
                          Take the next step in your career journey and become part of our amazing team
                        </p>
                        <Button
                          onClick={() => applyJobHandler(job.job_id)}
                          disabled={btnLoading}
                          className="px-10 py-6 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 hover:scale-105 text-base sm:text-lg transition-all duration-200"
                        >
                          {btnLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-700 border-t-transparent"></div>
                              <span>Submitting Application...</span>
                            </>
                          ) : (
                            <>
                              <Briefcase size={20} />
                              <span>Apply for this Position</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default JobPage;