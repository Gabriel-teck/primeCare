"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, isAdminRole } from "@/context/AuthContext";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";

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

  if (!ready || !token || (user && !isAdmin)) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
