"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAdminRole } from "@/context/AuthContext";

export function DoctorGuard({ children }: { children: React.ReactNode }) {
  const { user, token, ready } = useAuth();
  const router = useRouter();

  const isDoctor = user?.role === "doctor";

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (user && !isDoctor) {
      if (isAdminRole(user.role)) {
        router.replace("/admin-dashboard");
      } else {
        router.replace("/patient-dashboard");
      }
    }
  }, [ready, token, user, isDoctor, router]);

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

  if (user && !isDoctor) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
