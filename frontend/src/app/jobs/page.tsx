"use client";
import { Job } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { job_service } from "@/context/AppContext";
import { Button } from "@/app/components/ui/button";
import { Briefcase, Filter, MapPin, Search, X, ChevronDown } from "lucide-react";
import Loading from "@/app/components/loading";
import JobCard from "../components/job-card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";

const locations: string[] = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Noida",
  "Gurgaon",
  "Ahmedabad",
  "Remote",
];

const JobsPage = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchInput, setSearchInput] = useState(""); // Input field value
  const [locationInput, setLocationInput] = useState(""); // Location dropdown value
  const [title, setTitle] = useState(""); // Actual filter for API
  const [location, setLocation] = useState(""); // Actual filter for API
  const [fulltime, setFulltime] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const token = Cookies.get("token") || "";

  async function fetchJobs() {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${job_service}/api/job/jobs/all?title=${title}&location=${location}&fulltime=${fulltime}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setJobs(data.jobs);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitle(searchInput);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update location immediately
  useEffect(() => {
    setLocation(locationInput);
  }, [locationInput]);

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [title, location]);

  const clearFilter = () => {
    setSearchInput("");
    setLocationInput("");
    setTitle("");
    setLocation("");
    setIsFilterOpen(false);
  };

  const hasActiveFilter = title || location;
  const activeFilterCount = [title, location].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Find Your Dream Job
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover amazing opportunities from top companies
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search job title..."
                  className="pl-12 h-12 sm:h-14 text-base border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              {/* Location Select */}
              <div className="sm:w-64 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={20} />
                <select
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full h-12 sm:h-14 pl-12 pr-10 text-base border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option value={loc} key={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {/* Filter Button */}
              <Button
                type="button"
                className="h-12 sm:h-14 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl gap-2 shadow-lg hover:shadow-xl transition-all relative"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter size={20} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Active Filters */}
            {hasActiveFilter && (
              <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active:
                </span>
                {title && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200 dark:border-blue-800">
                    <Search size={14} />
                    <span className="max-w-[150px] truncate">{title}</span>
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setTitle("");
                      }}
                      className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 text-sm font-medium border border-purple-200 dark:border-purple-800">
                    <MapPin size={14} />
                    {location}
                    <button
                      onClick={() => {
                        setLocationInput("");
                        setLocation("");
                      }}
                      className="hover:bg-purple-200 dark:hover:bg-purple-700 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <button
                  onClick={clearFilter}
                  className="ml-auto text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium underline underline-offset-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {jobs.length}
              </span>{" "}
              {jobs.length === 1 ? "job" : "jobs"} found
            </p>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loading />
          </div>
        ) : (
          <>
            {jobs && jobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.job_id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-24">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 mb-6 shadow-inner">
                  <Briefcase size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                  No Jobs Found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
                  We couldn&apos;t find any jobs matching your criteria. Try
                  adjusting your filters or search terms.
                </p>
                {hasActiveFilter && (
                  <Button
                    onClick={clearFilter}
                    className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Filter Dialog */}
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
                  <Filter className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                Filter Jobs
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <Label
                  htmlFor="dialog-title"
                  className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Search size={16} />
                  Job Title
                </Label>
                <Input
                  id="dialog-title"
                  type="text"
                  placeholder="e.g. Software Engineer, Product Manager"
                  className="h-12 text-base"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="dialog-location"
                  className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <MapPin size={16} />
                  Location
                </Label>
                <div className="relative">
                  <select
                    id="dialog-location"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="w-full h-12 px-4 pr-10 text-base border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option value={loc} key={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={clearFilter}
                className="flex-1 h-11"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default JobsPage;