"use client";

import { AppContextTypes, AppProviderProps, User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Cookies from "js-cookie";
import axios from "axios";

export const auth_service = `http://localhost:5000`;
export const utils_service = "http://localhost:5001";
export const user_service = `http://localhost:5002`;
export const job_service = `http://localhost:5003`;

const AppContext = createContext<AppContextTypes | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState<boolean>(() => {
        return Boolean(Cookies.get("token"));
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);

    const token = Cookies.get("token");

    async function fetchUser(){
        try {
            const {data} = await axios.get(`${user_service}/api/user/me`,{
                headers:{
                    Authorization: `Bearer ${token}`
                },
            });

            setUser(data);
           // setIsAuth(true);


        } catch (error) {
            console.log("Error While Fetching Currunt User:",error);
            setIsAuth(false)
        }finally{
            setLoading(false);
        }
    };

    async function updateProfilePic(formData: FormData)
    {
        setLoading(true);
        try {
            const {data} = await axios.put(`${user_service}/api/user/update/profile-picture`,formData,{
                
                headers:{
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
        }finally{
            setLoading(false);
        }
    }

     async function updateResume(formData: FormData)
    {
        setLoading(true);
        try {
            const {data} = await axios.put(`${user_service}/api/user/update/resume`,formData,{
                
                headers:{
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
        }finally{
            setLoading(false);
        }
    }

    async function updateUser(name:string,phoneNumber:string,bio:string) {
        setBtnLoading(true);
        try {
            const {data} = await axios.put(`${user_service}/api/user/update/profile`,{name,phoneNumber,bio},{
                    headers:{
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
        }finally{
            setBtnLoading(false);
        }
    }
    async function logoutUser() {
        Cookies.set("token", "");
        setUser(null);
        setIsAuth(false);
        toast.success("User LoggedOut Successfully.!")
    }

    async function addSkill(skillname:string,setSkill:React.Dispatch<React.SetStateAction<string | "">>) {
        setBtnLoading(true);
        try {
            const {data} = await axios.post(`${user_service}/api/user/skill/add`,{skillname},{
                headers:{
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
        }finally{
            setBtnLoading(false);
        }
    }

    
async function removeSkill(skillname:string) {
        setBtnLoading(true);
        try {
            const {data} = await axios.put(`${user_service}/api/user/skill/delete`,{skillname},{
                headers:{
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
        }finally{
            setBtnLoading(false);
        }
    }
    useEffect(() => {
        fetchUser()
    }, []);

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
                removeSkill
                
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
        throw new Error("UseAppData must be used within  App Provider");
    }

    return context;
};
