"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Register from '@/components/login/register'

export default function RegisterPage() {
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

  return <Register />
} 