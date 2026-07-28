"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, PREVIEW_TOKEN } from "@/context/AuthContext";

const PREVIEW_ENABLED = process.env.NEXT_PUBLIC_ADMIN_PREVIEW === "true";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, token, ready } = useAuth();
  const router = useRouter();

  const isPreviewSession = PREVIEW_ENABLED && token === PREVIEW_TOKEN;
  const isAdmin =
    isPreviewSession || user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (!ready) return;

    if (!token && !PREVIEW_ENABLED) {
      router.replace("/login");
      return;
    }

    if (token && user && !isAdmin) {
      router.replace("/patient-dashboard");
    }
  }, [ready, token, user, isAdmin, router]);

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
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}
