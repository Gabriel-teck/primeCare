"use client";

import { Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCall } from "@/context/CallProvider";
import type { CallMode } from "@/lib/api/calls";

export function callModeFromConsultationType(
  consultationType?: string | null,
): CallMode {
  const t = (consultationType || "").toLowerCase();
  if (t.includes("voice") || t.includes("audio")) return "audio";
  return "video";
}

type ConsultationCallActionsProps = {
  consultationId: string;
  /** Confirmed or rescheduled consultations with an assigned doctor */
  enabled: boolean;
  /** Booking type drives whether this starts a video or voice call */
  consultationType?: string | null;
  remoteName?: string;
  size?: "default" | "sm";
  className?: string;
};

export function ConsultationCallActions({
  consultationId,
  enabled,
  consultationType,
  remoteName,
  size = "default",
  className,
}: ConsultationCallActionsProps) {
  const { startConsultationCall, activeCall } = useCall();

  if (!enabled) return null;

  const mode = callModeFromConsultationType(consultationType);
  const busy = Boolean(activeCall);
  const label = mode === "audio" ? "Start voice call" : "Start video call";
  const Icon = mode === "audio" ? Phone : Video;

  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      <Button
        type="button"
        size={size}
        className="bg-green-700 hover:bg-green-600"
        disabled={busy}
        onClick={() =>
          void startConsultationCall(consultationId, mode, remoteName)
        }
      >
        <Icon className={size === "sm" ? "mr-1 h-3 w-3" : "mr-2 h-4 w-4"} />
        {label}
      </Button>
    </div>
  );
}

export function isConsultationCallable(
  status: string,
  doctorId?: string | null,
) {
  const s = status.toLowerCase();
  return Boolean(doctorId) && (s === "confirmed" || s === "rescheduled");
}
