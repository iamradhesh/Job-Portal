"use client";

import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { job_service, useAppData } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { Company, Job } from "@/types";
import axios from "axios";
import toast from "react-hot-toast";

// UI Components
import Loading from "@/app/components/loading";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import {
  Briefcase,
  Building2,
  Check,
  Clock,
  Eye,
  FileText,
  Globe,
  IndianRupee,
  Laptop,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CompanyPage = () => {
  const { id } = useParams();
  const token = Cookies.get("token");
  const { user } = useAppData();

  // State Management
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Form Refs
  const addModalRef = useRef<HTMLButtonElement>(null);

  // Job Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [openings, setOpenings] = useState("");
  const [job_type, setJobType] = useState("");
  const [work_location, setWorkLocation] = useState("");
  const [is_active, setIsActive] = useState(true);

  const clearInput = () => {
    setTitle("");
    setDescription("");
    setRole("");
    setLocation("");
    setSalary("");
    setOpenings("");
    setJobType("");
    setWorkLocation("");
    setIsActive(true);
  };

  async function fetchCompany() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${job_service}/api/job/company/${id}`);
      setCompany(data.company);
    } catch (error) {
      toast.error("Failed to fetch company data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const isRecruiterOwner = user && company && user.user_id === company.recruiter_id;

  // Handlers
  const addJobHandler = async () => {
    if (!title || !description || !role || !salary || !job_type || !work_location) {
      toast.error("Please fill all required fields");
      return;
    }
    setBtnLoading(true);
    try {
      const jobData = {
        title, description, role, location,
        salary: Number(salary),
        openings: Number(openings),
        job_type, work_location, is_active,
        company_id: company?.company_id,
      };

      await axios.post(`${job_service}/api/job/new`, jobData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Job added successfully");
      clearInput();
      fetchCompany();
      addModalRef.current?.click(); // Close Modal
    } catch (error) {
      toast.error("Failed to add job");
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    setBtnLoading(true);
    try {
      await axios.delete(`${job_service}/api/job/delete/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Job deleted successfully");
      fetchCompany();
    } catch (error) {
      toast.error("Failed to delete job");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleOpenUpdateModal = (job: Job) => {
    setSelectedJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRole(job.role);
    setLocation(job.location ?? "");
    setSalary(String(job.salary || ""));
    setOpenings(String(job.openings || ""));
    setJobType(job.job_type);
    setWorkLocation(job.work_location);
    setIsActive(job.is_active);
    setIsUpdateModalOpen(true);
  };

  const updateJobHandler = async () => {
    if (!selectedJob) return;
    setBtnLoading(true);
    try {
      const updateData = {
        title, description, role, location,
        salary: Number(salary),
        openings: Number(openings),
        job_type, work_location, is_active,
      };
      await axios.put(`${job_service}/api/job/update/${selectedJob.job_id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Job updated successfully");
      setIsUpdateModalOpen(false);
      clearInput();
      fetchCompany();
    } catch (error) {
      toast.error("Failed to update job");
    } finally {
      setBtnLoading(false);
    }
  };

  const normalizeUrl = (url?: string) => {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary/30">
      {company && (
        <div className="px-3 py-4 sm:px-4 sm:py-6 md:py-8 max-w-6xl mx-auto">
          {/* COMPANY HEADER CARD */}
          <Card className="overflow-hidden shadow-lg border-2 mb-8">
            <div className="h-24 sm:h-32 bg-blue-600" />
            <div className="px-4 pb-4 sm:px-8 sm:pb-8">
              <div className="flex flex-col gap-4 items-start -mt-12 sm:-mt-16 md:flex-row md:gap-6 md:items-end">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-background overflow-hidden shadow-xl bg-background shrink-0">
                  <Image src={company.logo} alt="logo" fill className="object-cover" />
                </div>
                <div className="flex-1 w-full md:mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1">{company.name}</h1>
                  <p className="text-sm sm:text-base opacity-80 md:max-w-3xl">{company.description}</p>
                </div>
                <Link href={normalizeUrl(company.website)} target="_blank" className="w-full md:w-auto md:mb-4">
                  <Button variant="outline" className="gap-2 w-full">
                    <Globe size={18} /> Visit Website
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* JOBS SECTION */}
          <Card className="shadow-lg border-2 overflow-hidden">
            <div className="bg-blue-600 border-b p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Open Positions</h2>
                <p className="text-blue-100 text-sm">{company.jobs?.length || 0} active listings</p>
              </div>

              {isRecruiterOwner && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="gap-2 w-full sm:w-auto">
                      <Plus size={18} /> Post Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Post a New Job</DialogTitle>
                    </DialogHeader>
                    {/* JOB FORM REUSABLE CONTENT */}
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Software Engineer" />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Frontend Developer" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief job description" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Salary (Annual)</Label>
                          <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="800000" />
                        </div>
                        <div className="space-y-2">
                          <Label>Openings</Label>
                          <Input type="number" value={openings} onChange={(e) => setOpenings(e.target.value)} placeholder="2" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Job Type</Label>
                          <Select value={job_type} onValueChange={setJobType}>
                            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Full-time">Full-time</SelectItem>
                              <SelectItem value="Part-time">Part-time</SelectItem>
                              <SelectItem value="Contract">Contract</SelectItem>
                              <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Work Location</Label>
                          <Select value={work_location} onValueChange={setWorkLocation}>
                            <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Remote">Remote</SelectItem>
                              <SelectItem value="On-site">On-site</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>City/Location</Label>
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bangalore, India" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button ref={addModalRef} variant="outline">Cancel</Button></DialogClose>
                      <Button onClick={addJobHandler} disabled={btnLoading}>
                        {btnLoading ? "Posting..." : "Post Job"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* JOB LISTING */}
            <div className="p-4 sm:p-6 space-y-4">
              {company.jobs?.map((job) => (
                <div key={job.job_id} className="p-4 sm:p-5 rounded-lg border-2 bg-background hover:border-blue-500 transition shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold">{job.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${job.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {job.is_active ? <Check size={10} /> : <X size={10} />} {job.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm opacity-70">
                        <span className="flex items-center gap-1"><Briefcase size={14} /> {job.role}</span>
                        <span className="flex items-center gap-1"><IndianRupee size={14} /> {job.salary?.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                        <span className="flex items-center gap-1"><Users size={14} /> {job.openings} Opening{job.openings > 1 ? "s" : ""}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {job.work_location}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <Link href={`/jobs/${job.job_id}`}>
                        <Button size="sm" variant="outline" className="gap-1"><Eye size={14} /> View</Button>
                      </Link>
                      {isRecruiterOwner && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleOpenUpdateModal(job)} className="gap-1 text-blue-600 border-blue-200">
                            <Pencil size={14} /> Edit
                          </Button>
                          {/* <Button size="sm" variant="destructive" onClick={() => deleteHandler(job.job_id.toString())} disabled={btnLoading}>
                            <Trash2 size={14} />
                          </Button> */}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {company.jobs?.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                    <Briefcase size={32} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="text-gray-500">
                    <h3 className="text-lg font-medium mb-2">No job postings yet</h3>
                    <p className="text-sm">There are currently no job openings listed for this company.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* UPDATE JOB DIALOG (Standalone) */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Update Job Position</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary</Label>
                <Input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Openings</Label>
                <Input type="number" value={openings} onChange={(e) => setOpenings(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={is_active ? "true" : "false"} onValueChange={(v) => setIsActive(v === "true")}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                   </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <Label>Job Type</Label>
                 <Select value={job_type} onValueChange={setJobType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="Full-time">Full-time</SelectItem>
                       <SelectItem value="Part-time">Part-time</SelectItem>
                       <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label>work location</Label>
                 <Select value={work_location} onValueChange={setWorkLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="Remote">Remote</SelectItem>
                       <SelectItem value="On-site">On-site</SelectItem>
                       <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button onClick={updateJobHandler} disabled={btnLoading}>
              {btnLoading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyPage;