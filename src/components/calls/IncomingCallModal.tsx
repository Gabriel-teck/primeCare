"use client";

import { Phone, PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CallMode } from "@/lib/api/calls";

type IncomingCallModalProps = {
  fromName: string;
  mode: CallMode;
  accepting?: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export function IncomingCallModal({
  fromName,
  mode,
  accepting,
  onAccept,
  onDecline,
}: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-semibold text-green-800">
          {fromName.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-center text-lg font-semibold text-[#212529]">
          Incoming {mode === "video" ? "video" : "voice"} call
        </h2>
        <p className="mt-1 text-center text-sm text-gray-500">{fromName}</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            type="button"
            size="icon"
            className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-500"
            onClick={onDecline}
            disabled={accepting}
            aria-label="Decline"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="h-14 w-14 rounded-full bg-green-700 hover:bg-green-600"
            onClick={onAccept}
            disabled={accepting}
            aria-label="Accept"
          >
            {mode === "video" ? (
              <Video className="h-6 w-6" />
            ) : (
              <Phone className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
