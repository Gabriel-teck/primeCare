"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";

export function PatientGuard({ children }: { children: React.ReactNode }) {
  const { user, token, ready } = useAuth();
  const router = useRouter();

  const isPatient = user?.role === "patient";

  useEffect(() => {
    if (!ready) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (user && !isPatient) {
      if (user.role === "doctor") {
        router.replace("/doctor-dashboard");
      } else {
        router.replace("/admin-dashboard");
      }
    }
  }, [ready, token, user, isPatient, router]);

  if (!ready || !token || (user && !isPatient)) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
