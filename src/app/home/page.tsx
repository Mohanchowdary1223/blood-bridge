"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import HomeComponent from '@/components/home/home';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.replace("/login");
        return;
      }
      const user = JSON.parse(userStr);
      if (user.role === "admin") {
        router.replace("/admin");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen">
      <HomeComponent />
    </div>
  );
}