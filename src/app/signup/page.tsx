"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Signup from '@/components/login/signup'

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          router.replace("/admin");
        }
      }
    }
  }, [router]);

  return <Signup />
} 