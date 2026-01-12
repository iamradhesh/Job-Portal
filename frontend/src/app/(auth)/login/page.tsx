"use client";

import Loading from "@/app/components/loading";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import Cookies from "js-cookie";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const { isAuth, setIsAuth, loading, setUser } = useAppData();
  const router = useRouter();
 
   // ✅ redirect AFTER render
  useEffect(() => {
    if (isAuth) {
      router.push("/");
    }
  }, [isAuth, router]);

if(loading)
  {
    return <Loading />
  }
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const { data } = await axios.post(`${auth_service}/api/auth/login`, {
        email,
        password,
      });
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 7,
        secure: process.env.NODE_ENV==="production",
        path: "/",
      });
      setUser(data.userObject);
      setIsAuth(true);
      //Redirect to homePage after login here:-
      router.push('/');
    } catch (err: unknown) {
      let message = "Something went wrong";

      if (axios.isAxiosError(err)) {
        // Axios error
        message = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        // Native JS error
        message = err.message;
      }

      toast.error(message);
    } finally {
      setBtnLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome Backe To{" "}
            <span className="bg-linear-to-r from bg-blue-600 to-blue-800 bg-clip-text text-transparent">
              Hire
            </span>
            <span className="text-red-500">Hub</span>
          </h1>
          <p className="text-sm font-semibold opacity-70">
            Sign In to Continue Your Journey
          </p>
        </div>
        <div className="border border-gray-400 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={submitHandler} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative flex gap-2">
                <Mail className="icon-style" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* Password */}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative flex gap-2">
                <Lock className="icon-style" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href={"/forgot"}
                className="text-sm text-blue-500 hover:underline transition-all"
              >
                Forgot Password?
              </Link>
            </div>
            <Button type="submit" disabled={btnLoading} className="w-full">
              {btnLoading ? "Signing in..." : "Sign In"}
              <ArrowRight size={18} />
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-400">
            <p className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href={"/register"}
                className="text-blue-500 font-medium hover:underline transition-all"
              >
                Create a new Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
