"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuth,
  DOCTOR_PREVIEW_TOKEN,
  isAdminRole,
} from "@/context/AuthContext";

const DOCTOR_PREVIEW = process.env.NEXT_PUBLIC_DOCTOR_PREVIEW === "true";

export function DoctorGuard({ children }: { children: React.ReactNode }) {
  const { user, token, ready, enterPreviewDoctor } = useAuth();
  const router = useRouter();

  const isPreviewSession = DOCTOR_PREVIEW && token === DOCTOR_PREVIEW_TOKEN;
  const isDoctor = isPreviewSession || user?.role === "doctor";

  useEffect(() => {
    if (!ready) return;

    if (DOCTOR_PREVIEW && user?.role !== "doctor") {
      enterPreviewDoctor();
      return;
    }

    if (!token && !DOCTOR_PREVIEW) {
      router.replace("/login");
      return;
    }

    if (token && user && !isDoctor) {
      if (isAdminRole(user.role)) {
        router.replace("/admin-dashboard");
      } else {
        router.replace("/patient-dashboard");
      }
    }
  }, [ready, token, user, isDoctor, router, enterPreviewDoctor]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Checking access...
      </div>
    );
  }

  if (!token && !DOCTOR_PREVIEW) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Redirecting to login...
      </div>
    );
  }

  if (user && !isDoctor && !DOCTOR_PREVIEW) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Redirecting...
      </div>
    );
  }

  if (DOCTOR_PREVIEW && user?.role !== "doctor") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
        Loading doctor preview...
      </div>
    );
  }

  return <>{children}</>;
}
