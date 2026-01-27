"use client";

import { useEffect, useState } from "react";



const useRazorpay = () => {
  const [loaded, setLoaded] = useState(
    typeof window !== "undefined" && !!window.Razorpay
  );

  useEffect(() => {
    if (loaded) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => setLoaded(true);

    document.body.appendChild(script);
  }, [loaded]);

  return loaded;
};

export default useRazorpay;
