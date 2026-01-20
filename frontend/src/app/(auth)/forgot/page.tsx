"use client";
import { auth_service, useAppData, user_service } from "@/context/AppContext";
import axios, { AxiosError } from "axios";
import { redirect, useRouter } from "next/navigation"; // Using useRouter for cleaner navigation
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Label } from "../../components/ui/label";

const ForgotPage = () => {
  const [email, setEmail] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const { isAuth } = useAppData();
  const router = useRouter();

  // Handle authentication redirect in a useEffect to avoid hydration mismatches
  useEffect(() => {
    if (isAuth) {
      router.push("/");
    }
  }, [isAuth, router]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const { data } = await axios.post(`${auth_service}/api/auth/forgot`, {
        email,
      });
      console.log("Token:", data.token)
      toast.success(data.message || "Reset link sent to your email!");
      setEmail("");

      /**
       * 1. Use router.push instead of redirect for client-side transitions.
       * 2. Use the URL path (e.g., /reset/...), not the file system path.
       * 3. If your backend returns the token in 'data', use it here.
       */
      if (data.token) {
        toast.success("Redirecting to reset page...");
      // Use the real token from the backend response
      // router.push(`/reset/${data.token}`);
    } else {
      // Normal production flow: Token is sent to email, not returned to UI
      toast.success("Please check your email for the reset link!");
    } 

    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "Something went wrong. Please try again.";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setBtnLoading(false);
    }
  };

  if (isAuth) return null; // Prevent flickering while redirecting

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        {/* Header Section */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        {/* Form Section */}
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </Label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={btnLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {btnLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-4">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPage;
