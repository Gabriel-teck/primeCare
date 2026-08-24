"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { isAdminRole, useAuth } from "@/context/AuthContext";
import type { CatalogItem } from "@/types";

const PATIENT_APPOINTMENT = "/patient-dashboard/appointment";

type CareServiceDetailProps = {
  item: CatalogItem;
};

export default function CareServiceDetail({ item }: CareServiceDetailProps) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);

  const checking = !ready || pending;

  const onBook = () => {
    if (!agreed || !ready || pending) return;

    setPending(true);

    const next = `${PATIENT_APPOINTMENT}?catalogId=${encodeURIComponent(item.id)}`;

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (user.role === "patient") {
      router.push(next);
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
    <main className="bg-white min-h-[60vh]">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-32 md:pb-24">
        <p className="text-[#1d884a] text-[15px] md:text-base font-normal leading-6">
          PrimeCare Telehealth offers 24/7 online diagnosis and treatment via
          your mobile device.
        </p>

        <h1 className="mt-8 text-[#333333] text-[36px] md:text-[44px] font-semibold leading-tight tracking-tight">
          {item.name}
        </h1>
        <div
          className="mt-3 h-[6px] w-[140px] md:w-[180px] rounded-sm bg-[#1d884a]"
          aria-hidden
        />

        <p className="mt-8 text-[#666666] text-[15px] md:text-base font-normal leading-7 whitespace-pre-line">
          {item.description}
        </p>

        <p className="mt-8 text-[#212529] text-[16px] md:text-[17px] font-bold leading-6">
          No do-it-yourself (DIY) with your health. Get treatment
        </p>

        <label className="mt-10 flex items-start gap-3 cursor-pointer select-none">
          <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
              aria-label="Agree to terms of use"
            />
            <span
              className="flex size-5 items-center justify-center rounded-full border-2 border-[#1d884a] bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#1d884a]/40"
              aria-hidden
            >
              {agreed ? (
                <span className="size-2.5 rounded-full bg-[#1d884a]" />
              ) : null}
            </span>
          </span>
          <span className="text-[#666666] text-[14px] md:text-[15px] leading-6">
            I certify that the insurance or payment selected is the one that I
            will be using when I see this medical professional, and that I have
            read and agree to the PrimeCare Telehealth{" "}
            <Link
              href="/#about"
              className="font-bold text-[#1d884a] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              terms of use
            </Link>
            .
          </span>
        </label>

        <div className="mt-12 flex justify-end">
          <Button
            type="button"
            onClick={onBook}
            disabled={!agreed || checking}
            className="rounded-full bg-[#1d884a] px-8 py-6 text-base font-semibold text-white hover:bg-[#176f3c] disabled:opacity-50"
          >
            {checking && agreed ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              "Book appointment"
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
