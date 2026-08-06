"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getDoctorAppointments,
  updateAppointment,
} from "@/lib/api/appointment";
import {
  getDoctorConsultations,
  updateConsultation,
} from "@/lib/api/consultation";
import type { AdminBooking } from "@/lib/admin/types";
import {
  bookingRouteId,
  mapDoctorBookings,
  parseBookingRouteId,
} from "@/lib/doctor/bookings";
import {
  ConsultationCallActions,
  isConsultationCallable,
} from "@/components/calls/ConsultationCallActions";
import { Loader2 } from "lucide-react";

export default function DoctorScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuth();
  const rawId = String(params.id || "");
  const parsed = parseBookingRouteId(rawId);

  const [booking, setBooking] = useState<AdminBooking | undefined>();
  const [related, setRelated] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !parsed) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [appts, consults] = await Promise.all([
          getDoctorAppointments(token),
          getDoctorConsultations(token),
        ]);
        const all = mapDoctorBookings(appts || [], consults || []);
        const found = all.find(
          (b) => b.kind === parsed.kind && b.id === parsed.id,
        );
        setBooking(found);
        setRelated(
          found
            ? all.filter(
                (b) =>
                  b.email.toLowerCase() === found.email.toLowerCase() &&
                  !(b.kind === found.kind && b.id === found.id),
              )
            : [],
        );
      } catch {
        toast.error("Failed to load booking");
        setBooking(undefined);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, rawId]);

  const patientHref = useMemo(() => {
    if (!booking) return null;
    // Prefer patientId from source if we can find it via related list later; use email search path
    return `/doctor-dashboard/patients`;
  }, [booking]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d884a]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <AdminPageHeader title="Booking not found" />
        <Button
          variant="outline"
          onClick={() => router.push("/doctor-dashboard/schedule")}
        >
          Back to schedule
        </Button>
      </div>
    );
  }

  const setStatus = async (status: string) => {
    if (!token) return;
    try {
      if (booking.kind === "consultation") {
        await updateConsultation(booking.id, { status }, token);
      } else {
        await updateAppointment(booking.id, { status }, token);
      }
      setBooking((prev) => (prev ? { ...prev, status } : prev));
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Could not update status");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={booking.fullName}
        description={`${booking.kind} · ${booking.date} at ${booking.time}`}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push("/doctor-dashboard/schedule")}
          >
            Back
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminSectionCard title="Details" className="lg:col-span-2">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="mt-1">
                <AdminStatusBadge status={booking.status} />
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="mt-1 capitalize text-[#212529]">
                {booking.kind} · {booking.typeLabel}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="mt-1 text-[#212529]">{booking.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="mt-1 text-[#212529]">
                {booking.phoneNumber || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Reason</dt>
              <dd className="mt-1 text-[#212529]">{booking.reason || "—"}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            {booking.status === "pending" ? (
              <Button
                className="bg-green-700 hover:bg-green-600"
                onClick={() => void setStatus("confirmed")}
              >
                Confirm
              </Button>
            ) : null}
            {booking.status === "confirmed" || booking.status === "pending" ? (
              <Button
                variant="outline"
                onClick={() => void setStatus("completed")}
              >
                Complete
              </Button>
            ) : null}
            {booking.status !== "cancelled" &&
            booking.status !== "completed" ? (
              <Button
                variant="ghost"
                className="text-red-600"
                onClick={() => void setStatus("cancelled")}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Patient">
          <p className="text-sm text-[#212529]">{booking.fullName}</p>
          <p className="text-xs text-gray-500">{booking.email}</p>
          {patientHref ? (
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href={patientHref}>View patients</Link>
            </Button>
          ) : null}
        </AdminSectionCard>

        {booking.kind === "consultation" ? (
          <AdminSectionCard title="Consultation call" className="lg:col-span-3">
            {isConsultationCallable(booking.status, user?.id) ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Start a secure in-app{" "}
                  {booking.typeLabel?.toLowerCase().includes("voice")
                    ? "voice"
                    : "video"}{" "}
                  call with {booking.fullName}.
                </p>
                <ConsultationCallActions
                  consultationId={booking.id}
                  enabled
                  remoteName={booking.fullName}
                  consultationType={booking.typeLabel}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Calls are available once this consultation is confirmed.
              </p>
            )}
          </AdminSectionCard>
        ) : null}

        <AdminSectionCard
          title="Other bookings with this patient"
          className="lg:col-span-3"
        >
          {related.length === 0 ? (
            <p className="text-sm text-gray-500">No other bookings.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {related.map((b) => (
                <li
                  key={bookingRouteId(b)}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="capitalize">
                    {b.kind} · {b.date} {b.time}
                  </span>
                  <div className="flex items-center gap-2">
                    <AdminStatusBadge status={b.status} />
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/doctor-dashboard/schedule/${bookingRouteId(b)}`}
                      >
                        Open
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
