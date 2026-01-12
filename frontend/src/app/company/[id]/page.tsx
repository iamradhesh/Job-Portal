"use client";

import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { job_service, useAppData } from "@/context/AppContext";
import { useEffect, useRef, useState } from "react";
import { Company, Job } from "@/types";
import axios from "axios";

import toast from "react-hot-toast";
import Loading from "@/app/components/loading";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Globe } from "lucide-react";

const CompanyPage = () => {
  const { id } = useParams();
  const token = Cookies.get("token");
  console.log("Company ID:", id);

  const { user, isAuth } = useAppData();

  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [isUpdatedmodalOpen, setIsUpdatedmodalOpen] = useState(false);
  const [selectedJob,setSelectedJob] = useState<Job|null>(null);

  const addModalRef = useRef<HTMLButtonElement>(null);
  const updatedModalRef  = useRef<HTMLButtonElement>(null);

  const [title,setTitle] = useState<string>("");
  const [description,setDescription] = useState<string>("");
  const [role,setRole] = useState<string>("");
  const [location,setLocation] = useState<string>("");
  const [salary,setSalary] = useState<string>("");
  const [openings,setOpenings] = useState<number>(0);
  const [job_type,setJobType] = useState<string>("");
  const [work_location,setWorkLocation] = useState<string>("");
  const [isActive,setIsActive] = useState<boolean>(true);

  async function fetchCompany() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${job_service}/api/job/company/${id}`);
      console.log("data:", data);
      setCompany(data.company);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch company data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const normalizeUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  if (loading) {
    return <Loading />;
  }
  const isRecuiterOwner = user && company && user.user_id === company.recruiter_id;
  
  const clearInput = () =>{
    setTitle("");
    setDescription("");
    setRole("");
    setLocation("");
    setSalary("");
    setOpenings(0);
    setJobType("");
    setWorkLocation("");
    setIsActive(true);
  }
    
const addJobHandler = async() =>{
    if(!title || !description || !role || !location || !salary || !job_type || !work_location){
      toast.error("Please fill all the fields");
      return;
    }
    setBtnLoading(true);
    try {
        const jobData = {
            title,description,role,location,salary : Number(salary),openings,job_type,work_location,isActive,
            company_id:company?.company_id
        };

        await axios.post(`${job_service}/api/job/new`,jobData,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        toast.success("Job added successfully");
        clearInput();
        fetchCompany();
        addModalRef.current?.click();
    } catch (error) {
        console.log(error)
        toast.error("Failed to add job");
    }finally{
        setBtnLoading(false);
    }
}
  return (
    <div className="min-h-screen bg-secondary/30">
      {company && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="overflow-hidden shadow-lg border-2 mb-8">
            <div className="h-32 bg-blue-600"></div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                <div className="relative w-32 h-32 rounded-2xl border-4 border-background overflow-hidden shadow-xl bg-background shrink-0">
                  <Image
                    src={company?.logo}
                    alt="company-logo"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="flex-1 md:mb-4">
                  <h1 className="text-3xl font-bold mb-2">{company?.name}</h1>
                  <p className="text-base leading-relaxed opacity-80 max-w-3xl">
                    {company?.description}
                  </p>
                </div>
                <Link
                  href={normalizeUrl(company?.website)}
                  target="_blank"
                  className="md:mb-4"
                >
                  <Button variant="outline" className="gap-2">
                    {" "}
                    <Globe size={18} /> Visit Website
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
