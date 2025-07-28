"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfileType } from "@/lib/profile-utils";
import DonorHome from "@/components/home/user-types/donor-home";
import DonateLaterHome from "@/components/home/user-types/donate-later-home";
import HealthIssueHome from "@/components/home/user-types/health-issue-home";
import UnderAgeHome from "@/components/home/user-types/under-age-home";
import AboveAgeHome from "@/components/home/user-types/above-age-home";


export default function HomePage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.replace("/login");
        return;
      }
      const userObj = JSON.parse(userStr);
      setUser(userObj);
      if (userObj.role === "admin") {
        router.replace("/admin");
        return;
      }
      setUserType(getProfileType(userObj));
    }
  }, [router]);


  if (!userType || !user) return null;

  // If blocked, redirect to /blocked-home and render nothing (no navbar, no UI)
  if (user.role === "blocked") {
    if (typeof window !== "undefined") {
      window.location.replace("/blocked-home");
    }
    return null;
  }

  switch (userType) {
    case "donor":
      return <DonorHome />;
    case "donateLater":
      return <DonateLaterHome />;
    case "healthIssue":
      return <HealthIssueHome />;
    case "underAge":
      return <UnderAgeHome />;
    case "aboveAge":
      return <AboveAgeHome />;
    default:
      return <DonorHome />;
  }
}