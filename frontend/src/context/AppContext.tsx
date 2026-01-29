"use client";

import { AppContextTypes, Application, AppProviderProps, User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";

export const auth_service = `https://job-portal-authservice.onrender.com`;
export const utils_service = "https://job-portal-utils-n70j.onrender.com";
export const user_service = `https://job-portal-user-abbp.onrender.com`;
export const job_service = `https://job-portal-job-l0b6.onrender.com`;
export const payment_service = `https://job-portal-payment.onrender.com`;

const AppContext = createContext<AppContextTypes | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState<boolean>(() => {
        return Boolean(Cookies.get("token"));
    });

    const [loading, setLoading] = useState<boolean>(true); // Changed to true initially
    const [btnLoading, setBtnLoading] = useState<boolean>(false);

    const token = Cookies.get("token");

    async function fetchUser() {
        try {
            setLoading(true);
            const { data } = await axios.get(`${user_service}/api/user/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            setUser(data);
            setIsAuth(true);

        } catch (error) {
            console.log("Error While Fetching Current User:", error);
            setIsAuth(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    async function updateProfilePic(formData: FormData) {
        setLoading(true);
        try {
            const { data } = await axios.put(`${user_service}/api/user/update/profile-picture`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toast.success(data.message);
            fetchUser();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function updateResume(formData: FormData) {
        setLoading(true);
        try {
            const { data } = await axios.put(`${user_service}/api/user/update/resume`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            toast.success(data.message);
            fetchUser();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function updateUser(name: string, phoneNumber: string, bio: string) {
        setBtnLoading(true);
        try {
            const { data } = await axios.put(`${user_service}/api/user/update/profile`, { name, phoneNumber, bio }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            toast.success(data.message);
            fetchUser();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setBtnLoading(false);
        }
    }
    
    async function logoutUser() {
        Cookies.set("token", "");
        setUser(null);
        setIsAuth(false);
        toast.success("User LoggedOut Successfully.!")
        redirect('/login');
    }

    async function addSkill(skillname: string, setSkill: React.Dispatch<React.SetStateAction<string | "">>) {
        setBtnLoading(true);
        try {
            const { data } = await axios.post(`${user_service}/api/user/skill/add`, { skillname }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success(data.message);
            setSkill("");
            fetchUser();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setBtnLoading(false);
        }
    }

   async function applyJob(job_id: number) {
  if (!token) {
    toast.error("Please login to apply for jobs");
    return;
  }

  try {
    setBtnLoading(true);
    const { data } = await axios.post(
      `${user_service}/api/user/apply/job`,
      { job_id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success(data.message || "Applied successfully!");
    fetchApplications();
  } catch (error: unknown) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message || error.message || "Something went wrong";
      toast.error(message);
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Unexpected error occurred");
    }
  } finally {
    setBtnLoading(false);
  }
}


    async function removeSkill(skillname: string) {
        setBtnLoading(true);
        try {
            const { data } = await axios.put(`${user_service}/api/user/skill/delete`, { skillname }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            toast.success(data.message);

            fetchUser();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setBtnLoading(false);
        }
    }
    
    const [applications, setApplications] = useState<Application[] | null>(null)

    async function fetchApplications() {
        try {
            const { data } = await axios.get(`${user_service}/api/user/application/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setApplications(data.applications);

        } catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        if (token) {
            fetchUser();
            fetchApplications();
        } else {
            setLoading(false);
        }
    }, [token]);

    return (
        <AppContext.Provider
            value={{
                user,
                loading,
                btnLoading,
                setUser,
                isAuth,
                setIsAuth,
                setLoading,
                setBtnLoading,
                logoutUser,
                updateProfilePic,
                updateResume,
                updateUser,
                addSkill,
                removeSkill,
                applyJob,
                applications,
                fetchApplications,
                fetchUser  // ✅ ADD THIS - This was missing!
            }}
        >
            {children}
            <Toaster />
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextTypes => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("UseAppData must be used within App Provider");
    }

    return context;
};