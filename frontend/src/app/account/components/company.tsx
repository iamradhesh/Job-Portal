"use client";

import { job_service, useAppData } from "@/context/AppContext";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";

import toast from "react-hot-toast";
import Loading from "@/app/components/loading";
console.log("🔥 Company component rendered");

import {
  Briefcase,
  Building2,
  Eye,
  FileText,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Company as CompanyType } from "@/types";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const Company = () => {
  const { user } = useAppData();
  const addRef = useRef<HTMLButtonElement | null>(null);
  console.log("USER:", user);

  // ✅ ALL HOOKS FIRST (no early return before hooks)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [companyLoading, setCompanyLoading] = useState(true);

  const token = Cookies.get("token") || "";
  const isRecruiter = user?.role === "recruiter";

  const clearData = () => {
    setName("");
    setDescription("");
    setWebsite("");
    setLogo(null);
  };

  const openDialog = () => addRef.current?.click();

  async function fetchCompanies() {
    if (!token || !isRecruiter) return;

    try {
      setCompanyLoading(true);
      const { data } = await axios.get(`${job_service}/api/job/company/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(data.companies || []);
    } catch (error) {
      console.error("API error fetching companies:", error);
    } finally {
      setCompanyLoading(false);
    }
  }

  async function addCompanyHandler() {
    if (!name || !description || !website || !logo) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setBtnLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("website", website);
      formData.append("file", logo);

      const { data } = await axios.post(
        `${job_service}/api/job/company/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(data.message || "Company added successfully");
      clearData();
      fetchCompanies();
      addRef.current?.click();
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;

      toast.error(
        err.response?.data?.message || err.message || "Failed to add company",
      );
    } finally {
      setBtnLoading(false);
    }
  }

  async function deleteCompanyHandler(id: string) {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;

    try {
      setBtnLoading(true);
      const { data } = await axios.delete(
        `${job_service}/api/job/company/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(data.message || "Company deleted");
      fetchCompanies();
    } catch {
      toast.error("Failed to delete company");
    } finally {
      setBtnLoading(false);
    }
  }

  useEffect(() => {
    if (isRecruiter) fetchCompanies();
  }, [token, isRecruiter]);

  // 🔐 UI GUARD (after hooks)
  if (!user || !isRecruiter) return null;

  return (
    <div className="max-w-7xl mx-auto py-2">
      <Card className="shadow-lg border-2 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-6 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-2xl font-bold">
                  My Companies
                </CardTitle>
                <CardDescription className="text-blue-100 font-medium">
                  Manage Your Business Profiles ({companies.length}/3)
                </CardDescription>
              </div>
            </div>

            {companies.length < 3 && (
              <Button onClick={openDialog} variant="secondary">
                <Plus size={18} className="mr-2" />
                Add Company
              </Button>
            )}
          </div>
        </div>

        {companyLoading ? (
          <div className="p-10 flex justify-center">
            <Loading />
          </div>
        ) : (
          <div className="p-6">
            {companies.length > 0 ? (
              <div className="grid gap-4">
                {companies.map((c) => (
                  <div
                    key={c.company_id}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 bg-card"
                  >
                    <div className="h-16 w-16 rounded-lg border-2 overflow-hidden shrink-0 bg-muted">
                      <Image
                        src={c.logo}
                        width={64}
                        height={64}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{c.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-1">
                        {c.description}
                      </p>
                      <Link
                        href={
                          c.website.startsWith("http")
                            ? c.website
                            : `https://${c.website}`
                        }
                        target="_blank"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Globe size={14} />
                        {c.website}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/company/${c.company_id}`}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                        >
                          <Eye size={18} />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full"
                        disabled={btnLoading}
                        onClick={() => deleteCompanyHandler(c.company_id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                  <Building2 size={40} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                  No companies registered
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Add your first company to start posting job openings.
                </p>
                <Button onClick={openDialog}>Register Company Now</Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add Company Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="hidden" ref={addRef}>
            Open
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Plus className="text-blue-600" />
              Register New Company
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Company Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={btnLoading}
              onClick={addCompanyHandler}
              className="w-full"
            >
              {btnLoading ? "Processing..." : "Create Company Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Company;
