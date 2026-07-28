"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getBookingById,
  getPatientByEmail,
  mockDoctorBookings,
} from "@/lib/doctor/mock-data";
import type { AdminBooking } from "@/lib/admin/types";

export default function DoctorScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const initial = getBookingById(id);

  const [booking, setBooking] = useState<AdminBooking | undefined>(initial);
  const [meetLink, setMeetLink] = useState(initial?.googleMeetLink || "");

  const patient = useMemo(
    () => (booking ? getPatientByEmail(booking.email) : undefined),
    [booking],
  );

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

  const setStatus = (status: string) => {
    setBooking((prev) => (prev ? { ...prev, status } : prev));
    toast.success(`Status updated to ${status}`);
  };

  const saveMeet = () => {
    setBooking((prev) =>
      prev ? { ...prev, googleMeetLink: meetLink.trim() || undefined } : prev,
    );
    toast.success("Meet link saved");
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
              <dd className="mt-1 text-[#212529]">
                {booking.reason || "No reason provided."}
              </dd>
            </div>
            {booking.fileName ? (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Attached file</dt>
                <dd className="mt-1 text-green-700">{booking.fileName}</dd>
              </div>
            ) : null}
          </dl>

          {booking.kind === "consultation" ? (
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <label className="block text-sm text-gray-600">
                Google Meet / session link
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
                <Button
                  className="shrink-0 bg-green-700 hover:bg-green-600"
                  onClick={saveMeet}
                >
                  Save link
                </Button>
              </div>
            </div>
          ) : null}
        </AdminSectionCard>

        <div className="space-y-4">
          <AdminSectionCard title="Actions">
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-green-700 hover:bg-green-600"
                onClick={() => setStatus("confirmed")}
              >
                Confirm
              </Button>
              <Button variant="outline" onClick={() => setStatus("completed")}>
                Complete
              </Button>
              <Button
                variant="outline"
                onClick={() => setStatus("rescheduled")}
              >
                Reschedule
              </Button>
              <Button
                variant="ghost"
                className="text-red-600"
                onClick={() => setStatus("cancelled")}
              >
                Cancel
              </Button>
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="Patient">
            {patient ? (
              <div className="space-y-3 text-sm">
                <p className="font-medium text-[#212529]">{patient.fullName}</p>
                <p className="text-gray-600">{patient.email}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={`/doctor-dashboard/patients/${patient.id}`}>
                    View patient
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-green-700 hover:bg-green-600"
                >
                  <Link
                    href={`/doctor-dashboard/messages?tab=patients&conversationId=${patient.id}`}
                  >
                    Message patient
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Patient profile not linked yet.
              </p>
            )}
          </AdminSectionCard>

          <AdminSectionCard title="Related bookings">
            <ul className="space-y-2 text-sm">
              {mockDoctorBookings
                .filter((b) => b.email === booking.email && b.id !== booking.id)
                .slice(0, 4)
                .map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/doctor-dashboard/schedule/${b.id}`}
                      className="text-green-700 hover:underline"
                    >
                      {b.date} · {b.kind}
                    </Link>
                  </li>
                ))}
            </ul>
          </AdminSectionCard>
        </div>
      </div>
    </div>
  );
}
