"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAdminRole } from "@/context/AuthContext";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, token, ready } = useAuth();
  const router = useRouter();

  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (user && !isAdmin) {
      if (user.role === "doctor") {
        router.replace("/doctor-dashboard");
      } else {
        router.replace("/patient-dashboard");
      }
    }
  }, [ready, token, user, isAdmin, router]);

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

  if (user && !isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
