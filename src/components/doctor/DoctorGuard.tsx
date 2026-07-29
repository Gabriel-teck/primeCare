"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAdminRole } from "@/context/AuthContext";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";

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

  if (!ready || !token || (user && !isDoctor)) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
