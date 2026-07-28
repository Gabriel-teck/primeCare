"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, PREVIEW_TOKEN, isAdminRole } from "@/context/AuthContext";

const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_ADMIN_PREVIEW === "true";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, token, ready, enterPreviewAdmin } = useAuth();
  const router = useRouter();

  const isPreviewSession = PREVIEW_ENABLED && token === PREVIEW_TOKEN;
  const isAdmin = isPreviewSession || isAdminRole(user?.role);

  useEffect(() => {
    if (!ready) return;

    if (
      PREVIEW_ENABLED &&
      user?.role !== "admin" &&
      user?.role !== "super_admin"
    ) {
      enterPreviewAdmin();
      return;
    }

    if (!token && !PREVIEW_ENABLED) {
      router.replace("/login");
      return;
    }

    if (token && user && !isAdmin) {
      if (user.role === "doctor") {
        router.replace("/doctor-dashboard");
      } else {
        router.replace("/patient-dashboard");
      }
    }
  }, [ready, token, user, isAdmin, router, enterPreviewAdmin]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Checking access...
      </div>
    );
  }

  if (!token && !PREVIEW_ENABLED) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Redirecting to login...
      </div>
    );
  }

  if (user && !isAdmin) {
    if (PREVIEW_ENABLED) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
          Loading admin preview...
        </div>
      );
    }
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
