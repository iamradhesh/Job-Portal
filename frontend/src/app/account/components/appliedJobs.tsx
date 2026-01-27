"use client"

import { Button } from '@/app/components/ui/button';
import { Card } from '@/components/ui/card';
import { Application } from '@/types';
import { 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    IndianRupee, 
    XCircle, 
    Calendar,
    Building2,
    MapPin,
    TrendingUp,
    AlertCircle,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface AppliedjobsProps {
    applications: Application[];
}

const Appliedjobs: React.FC<AppliedjobsProps> = ({ applications }) => {

    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case "hired":
                return {
                    icon: CheckCircle2,
                    color: "text-green-600 dark:text-green-400",
                    bg: "bg-green-100 dark:bg-green-900/30",
                    border: "border-green-300 dark:border-green-700",
                    label: "Hired",
                    description: "Congratulations! You've been selected for this position."
                };
            case "rejected":
                return {
                    icon: XCircle,
                    color: "text-red-600 dark:text-red-400",
                    bg: "bg-red-100 dark:bg-red-900/30",
                    border: "border-red-300 dark:border-red-700",
                    label: "Rejected",
                    description: "Unfortunately, your application was not selected."
                };
            case "pending":
                return {
                    icon: Clock,
                    color: "text-yellow-600 dark:text-yellow-400",
                    bg: "bg-yellow-100 dark:bg-yellow-900/30",
                    border: "border-yellow-300 dark:border-yellow-700",
                    label: "Under Review",
                    description: "Your application is being reviewed by the employer."
                };
            default:
                return {
                    icon: AlertCircle,
                    color: "text-blue-600 dark:text-blue-400",
                    bg: "bg-blue-100 dark:bg-blue-900/30",
                    border: "border-blue-300 dark:border-blue-700",
                    label: status,
                    description: "Application status is being processed."
                };
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className='max-w-6xl mx-auto px-4 py-6 sm:py-8'>
            <Card className='shadow-2xl border-2 overflow-hidden'>
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Briefcase size={24} className='text-white' />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold">Your Applications</h1>
                            <p className="text-sm sm:text-base text-blue-100 font-medium mt-1">
                                Track all your job applications in one place
                            </p>
                        </div>
                    </div>
                    
                    {/* Stats Bar */}
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <TrendingUp size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-blue-100">Total Applied</p>
                                <p className="text-lg font-bold">{applications.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-500/30 flex items-center justify-center">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-blue-100">Hired</p>
                                <p className="text-lg font-bold">
                                    {applications.filter(a => a.status.toLowerCase() === 'hired').length}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-yellow-500/30 flex items-center justify-center">
                                <Clock size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-blue-100">Pending</p>
                                <p className="text-lg font-bold">
                                    {applications.filter(a => a.status.toLowerCase() === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="p-4 sm:p-6">
                    {applications && applications.length > 0 ? (
                        <div className="space-y-4">
                            {applications.map((application) => {
                                const statusConfig = getStatusConfig(application.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <Card 
                                        key={application.application_id} 
                                        className="p-4 sm:p-6 border-2 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
                                    >
                                        {/* Job Title & Status */}
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {application.job_title}
                                                </h3>
                                                {/* {application.company_name && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                        <Building2 size={16} className="flex-shrink-0" />
                                                        <span className="truncate">{application.company_name}</span>
                                                    </div>
                                                )} */}
                                            </div>
                                            
                                            {/* Status Badge - Mobile Optimized */}
                                            <div className="relative group/status flex-shrink-0">
                                                <div 
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${statusConfig.bg} ${statusConfig.border} cursor-help transition-transform hover:scale-105`}
                                                    title={statusConfig.description}
                                                >
                                                    <StatusIcon size={18} className={statusConfig.color} />
                                                    <span className={`font-semibold text-xs sm:text-sm ${statusConfig.color} whitespace-nowrap`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                
                                                {/* Tooltip - Hidden on mobile */}
                                                <div className="hidden sm:block absolute top-full right-0 mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-200 z-10">
                                                    <p className="font-medium mb-1">{statusConfig.label}</p>
                                                    <p className="text-slate-300">{statusConfig.description}</p>
                                                    <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-900 rotate-45"></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Details Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                            {/* Salary */}
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                                                    <IndianRupee size={16} className="text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Salary</p>
                                                    <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400 truncate">
                                                        ₹{application.job_salary?.toLocaleString() || 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            {application.job_location && (
                                                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                    <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                                        <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-muted-foreground">Location</p>
                                                        <p className="font-bold text-sm text-blue-700 dark:text-blue-400 truncate">
                                                            {application.job_location}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Applied Date */}
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                                                <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                                                    <Calendar size={16} className="text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground">Applied On</p>
                                                    <p className="font-bold text-sm text-violet-700 dark:text-violet-400">
                                                        {formatDate(application.applied_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        {/* {application.decription && (
                                            <div className="pt-3 border-t">
                                                <p className="text-xs text-muted-foreground mb-1">Job Description</p>
                                                <p className="text-sm line-clamp-2">{application.job_description}</p>
                                            </div>
                                        )} */}
                                        <Link href={`/jobs/${application.job_id}`} className='shrink-0 flex items-center justify-center gap-1.5'>
                                            <Button variant={"ghost"}><Eye size={16} />
                                            View Job</Button>
                                        </Link>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Briefcase size={40} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                                You haven &apos t applied to any jobs yet. Start exploring opportunities and submit your applications to track them here.
                            </p>
                            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                                Browse Jobs
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Appliedjobs;