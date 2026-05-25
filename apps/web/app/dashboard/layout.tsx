"use client";

import { AppHeader } from "@/components/AppHeader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/signin");
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen grid place-items-center text-[14px] text-ink2">
        Checking session...
      </div>
    );
  }

  return (
    <div>
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}
