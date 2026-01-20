"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppData } from "@/context/AppContext";
import { Application, Job } from "@/types";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  IndianRupee,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user, btnLoading, applyJob, applications } = useAppData();
  const [applied, setApplied] = useState<boolean>(false);

  useEffect(() => {
    if (applications && job.job_id) {
      applications.forEach((item: Application) => {
        if (item.job_id === job.job_id) {
          setApplied(true);
        }
      });
    }
  }, [applications, job.job_id]);
  const applyJobHandler = (id: number) => {
    applyJob(id);
  };

  return (
    <Card className="w-full max-w-full sm:max-w-[380px] hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-500 group">
      <CardHeader className="space-y-3 sm:space-y-4 pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg sm:text-xl mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors break-words">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm opacity-70">
              <Building2 size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{job.company_name}</span>
            </div>
          </div>
          <Link href={`/company/${job.company_id}`} className="shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl border-2 overflow-hidden hover:scale-105 transition-transform bg-background">
              <img
                src={job.company_logo}
                alt="company_logo"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <MapPin size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="font-medium truncate">{job.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold">
            <IndianRupee
              size={16}
              className="sm:w-[18px] sm:h-[18px] text-green-600 flex-shrink-0"
            />
            <span>{job.salary} P.A</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row w-full gap-2">
          <Link
            href={`/jobs/${job.job_id}`}
            className="flex-1 w-full sm:w-auto"
          >
            <Button
              variant={"outline"}
              className="w-full gap-2 group/btn text-sm sm:text-base h-9 sm:h-10"
            >
              View Details
              <ArrowRight
                size={14}
                className="sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform"
              />
            </Button>
          </Link>
          {user && user.role === "jobseeker" && (
            <>
              {applied ? (
                <div
                  className="flex flex-1 items-center justify-center gap-2 text-green-600
                            font-medium text-sm bg-green-100 dark:bg-green-900/30 rounded-md px-3 py-2"
                >
                  <CheckCircle size={15} /> Applied
                </div>
              ) : (
                <>
                  {job.is_active !== false && (
                    <Button
                      disabled={btnLoading}
                      className="flex-1 w-full sm:w-auto gap-2 text-sm sm:text-base h-9 sm:h-10"
                      onClick={() => applyJobHandler(job.job_id)}
                    >
                      <Briefcase size={14} className="sm:w-4 sm:h-4" />
                      Easy Apply
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
        {job.is_active === false && (
          <div className="w-full text-center text-xs sm:text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded-md px-3 py-1.5 sm:py-2 font-medium">
            Position Closed
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
