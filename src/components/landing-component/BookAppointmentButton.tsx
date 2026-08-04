"use client";

import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isAdminRole, useAuth } from "@/context/AuthContext";

const PATIENT_APPOINTMENT = "/patient-dashboard/appointment";

export default function BookAppointmentButton() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [pending, setPending] = useState(false);

  const checking = !ready || pending;

  const onClick = () => {
    if (!ready || pending) return;

    setPending(true);

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(PATIENT_APPOINTMENT)}`);
      return;
    }

    if (user.role === "patient") {
      router.push(PATIENT_APPOINTMENT);
      return;
    }

    if (user.role === "doctor") {
      toast.message("Booking is for patient accounts.");
      router.push("/doctor-dashboard");
      return;
    }

    if (isAdminRole(user.role)) {
      toast.message("Booking is for patient accounts.");
      router.push("/admin-dashboard");
      return;
    }

    router.push("/login");
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="xl"
      onClick={onClick}
      disabled={checking}
      className="mt-[26px] rounded-full px-12 text-md md:text-lg bg-green-700 text-white hover:text-white hover:text-lg hover:bg-green-700 flex items-center gap-4 cursor-pointer disabled:opacity-80"
    >
      {checking ? (
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      ) : (
        <>
          Book <ChevronRight className="w-4 h-4" />
        </>
      )}
    </Button>
  );
}
