"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function PatientGuard({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
    }
  }, [ready, token, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Checking access...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}
