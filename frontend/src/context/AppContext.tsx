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

    async function logoutUser() {
        Cookies.set("token", "");
        setUser(null);
        setIsAuth(false);
        toast.success("User LoggedOut Successfully.!")
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
                logoutUser
                
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
