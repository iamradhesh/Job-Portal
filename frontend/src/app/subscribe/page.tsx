"use client";

import React, { useState } from "react";
import { Crown, CheckCircle, Sparkles, Zap, Star, TrendingUp } from "lucide-react";
import useRazorpay from "../components/ScriptLoader";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import { payment_service, useAppData } from "@/context/AppContext";
import toast from "react-hot-toast";
import { RazorpayResponse } from "@/types";
import Loading from "../components/loading";

const SubscriptionPage = () => {
  const razorpayLoaded = useRazorpay();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setUser, fetchUser } = useAppData();

  const handleSubscribe = async () => {
    if (!razorpayLoaded) {
      toast.error("Razorpay SDK not loaded");
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("token");

      const { data } = await axios.post(
        `${payment_service}/api/payment/checkout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { order } = data;

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY;
      
      if (!razorpayKey) {
        toast.error("Razorpay key is not configured");
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "Hire Hub",
        description: "Subscription Payment",
        order_id: order.id,

        handler: async function (response: RazorpayResponse) {
          try {
            const verifyRes = await axios.post(
              `${payment_service}/api/payment/verify`,
              response,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            toast.success(verifyRes.data.message);
            
            // Update user in context
            if (verifyRes.data.updatedUser) {
              setUser(verifyRes.data.updatedUser);
            }
            
            // Navigate to success page
            router.push(`/payment/success/${response.razorpay_payment_id}`);
            
          } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              toast.error(error.response?.data?.message || "Payment failed");
            } else if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error("Unable to verify payment");
            }
            console.error(error);
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },

        theme: {
          color: "#3399cc",
        },
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: unknown) {
      setLoading(false);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Unable to start payment");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }

      console.error(error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const features = [
    {
      icon: <TrendingUp size={20} className="text-blue-500" />,
      text: "Priority applications – get shown first to recruiters"
    },
    {
      icon: <Crown size={20} className="text-amber-500" />,
      text: "Profile highlighting with premium badge"
    },
    {
      icon: <Zap size={20} className="text-violet-500" />,
      text: "Direct recruiter messages & early access to jobs"
    },
    {
      icon: <Star size={20} className="text-emerald-500" />,
      text: "See who viewed your profile & application insights"
    },
    {
      icon: <Sparkles size={20} className="text-pink-500" />,
      text: "AI resume review & job-match suggestions"
    },
    {
      icon: <CheckCircle size={20} className="text-cyan-500" />,
      text: "Unlimited job applications"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg animate-pulse">
            <Crown size={32} className="text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Premium Subscription
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Accelerate your career journey
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 sm:py-4">
            <div className="flex items-center justify-center gap-2 text-white">
              <Sparkles size={20} className="animate-pulse" />
              <span className="font-semibold text-sm sm:text-base">Most Popular Plan</span>
              <Sparkles size={20} className="animate-pulse" />
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="text-center mb-8 sm:mb-10">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">₨</span>
                <span className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  200
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                per month • billed monthly
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
                  Cancel anytime
                </span>
              </div>
            </div>

            <div className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">
                Everything You Need to Succeed
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 group"
                  >
                    <div className="flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                      {feature.icon}
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-4 sm:py-5 px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base sm:text-lg group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Crown size={22} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>Subscribe Now</span>
                  <Sparkles size={22} className="group-hover:rotate-12 transition-transform duration-300" />
                </>
              )}
            </button>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-400" />
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Instant Access</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-400" />
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-6 sm:mt-8 px-4">
          Join thousands of professionals who have already upgraded their job search experience
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;
