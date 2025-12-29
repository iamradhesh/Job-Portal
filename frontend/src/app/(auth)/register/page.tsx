"use client";

import Loading from "@/app/components/loading";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import Cookies from "js-cookie";
import {
  ArrowRight,
  Book,
  BookImage,
  Briefcase,
  File,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const BIO_MAX_LENGTH = 300;
  const [resume, setResume] = useState<File | null>(null);
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

  if (loading) {
    return <Loading />;
  }
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);
    const formData = new FormData();
    formData.append("role", role);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);

    if (role === "jobseeker") {
      formData.append("bio", bio);
      if (resume) {
        formData.append("file", resume);
      }
    }

    try {
      const { data } = await axios.post(
        `${auth_service}/api/auth/register`,
        formData
      );
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      setUser(data.data);
      setIsAuth(true);
      //Redirect to homePage after login here:-
      router.push("/");
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
            Join{" "}
            <span className="bg-linear-to-r from bg-blue-600 to-blue-800 bg-clip-text text-transparent">
              Hire
            </span>
            <span className="text-red-500">Hub</span>
          </h1>
          <p className="text-sm font-semibold opacity-70">
            Sign Up to start Your Journey
          </p>
        </div>
        <div className="border border-gray-400 rounded-2xl p-8 shadow-lg backdrop-blur-sm">
          <form onSubmit={submitHandler} className="space-y-5">
            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                I want to
              </Label>
              <div className="relative flex gap-2">
                <Briefcase className="icon-style" />
                <select
                  id="role"
                  value={role}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setRole(e.target.value)
                  }
                  required
                  className="w-full h-11 pl-10 pr-4 border-2 border-gray-300 bg-transparent rounded-md"
                >
                  <option value={""}>Select your role</option>
                  <option value={"jobseeker"}>Find a Job</option>
                  <option value={"recruiter"}>Hire a Talent</option>
                </select>
              </div>
            </div>
            {role && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative flex gap-2">
                    <User className="icon-style" />
                    <Input
                      id="fullname"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

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
                {/* phone number */}

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative flex gap-2">
                    <Phone className="icon-style" />
                    <Input
                      id="phone"
                      type="number"
                      placeholder="+91 111xxxxxxx"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                {role === "jobseeker" && (
                  <div className="space-y-5 pt-4 border-t border-gray-400">
                    {/* Resume */}
                    <div className="space-y-2">
                      <Label htmlFor="resume" className="text-sm font-medium">
                        Upload Your Resume (PDF)
                      </Label>
                      <div className="relative flex gap-2">
                        <File className="icon-style " />
                        <Input
                          id="resume"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setResume(e.target.files[0]);
                            }
                          }}
                          className=" h-11 cursor-pointer pl-8"
                        />
                      </div>
                    </div>


                    {/* BIO */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-medium">
                        Bio
                      </Label>

                      <div className="relative">
                        <Book className="absolute left-3 top-3 h-5 w-5 text-gray-500" />

                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          maxLength={BIO_MAX_LENGTH}
                          required
                          className="pl-10 pr-3 resize-none"
                        />
                      </div>

                      {/* Character Counter */}
                      <div className="flex justify-end">
                        <span
                          className={`text-xs ${bio.length === BIO_MAX_LENGTH
                              ? "text-red-500"
                              : "text-gray-500"
                            }`}
                        >
                          {bio.length}/{BIO_MAX_LENGTH}
                        </span>
                      </div>
                    </div>


                  </div>
                )}
                <Button type="submit" disabled={btnLoading} className="w-full">
                  {btnLoading ? "Signing Up..." : "Sign Up"}
                  <ArrowRight size={18} />
                </Button>
              </div>
            )}
          </form>
          <div className="mt-6 pt-6 border-t border-gray-400">
            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href={"/login"}
                className="text-blue-500 font-medium hover:underline transition-all"
              >
                Sign In to Your Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
