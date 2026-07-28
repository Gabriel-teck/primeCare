"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllAppointments, updateAppointment } from "@/lib/api/appointment";
import {
  getAllConsultations,
  updateConsultation,
} from "@/lib/api/consultation";
import type { AdminBooking } from "@/lib/admin/types";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [booking, setBooking] = useState<AdminBooking | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;
    const [kind, ...rest] = params.id.split("-");
    const id = rest.join("-");

    const load = async () => {
      setLoading(true);
      try {
        if (kind === "consultation") {
          const list = await getAllConsultations(token);
          const found = (list || []).find((c: { id: string }) => c.id === id);
          if (found) {
            const mapped: AdminBooking = {
              id: found.id,
              fullName: found.fullName,
              email: found.email,
              phoneNumber: found.phoneNumber,
              date: found.date,
              time: found.time,
              status: found.status,
              reason: found.reason,
              kind: "consultation",
              typeLabel: found.consultationType || "consultation",
              googleMeetLink: found.googleMeetLink,
              fileName: found.fileName,
              fileUrl: found.fileUrl,
            };
            setBooking(mapped);
            setMeetLink(found.googleMeetLink || "");
          }
        } else {
          const list = await getAllAppointments(token);
          const found = (list || []).find((a: { id: string }) => a.id === id);
          if (found) {
            setBooking({
              id: found.id,
              fullName: found.fullName,
              email: found.email,
              phoneNumber: found.phoneNumber,
              date: found.date,
              time: found.time,
              status: found.status,
              reason: found.reason,
              kind: "appointment",
              typeLabel: found.appointmentType || "appointment",
            });
          }
        }
      } catch {
        toast.error("Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, params.id]);

  const saveMeetLink = async () => {
    if (!token || !booking || booking.kind !== "consultation") return;
    try {
      await updateConsultation(booking.id, { googleMeetLink: meetLink }, token);
      toast.success("Meet link saved");
    } catch {
      toast.error("Could not save Meet link");
    }
  };

  const setStatus = async (status: string) => {
    if (!token || !booking) return;
    try {
      if (booking.kind === "consultation") {
        await updateConsultation(booking.id, { status }, token);
      } else {
        await updateAppointment(booking.id, { status }, token);
      }
      setBooking({ ...booking, status });
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Could not update status");
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading booking…</p>;
  }

  if (!booking) {
    return (
      <div>
        <AdminPageHeader title="Booking not found" />
        <Button asChild variant="outline">
          <Link href="/admin-dashboard/bookings">Back to bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={booking.fullName}
        description={`${booking.kind} · ${booking.date} at ${booking.time}`}
        actions={<AdminStatusBadge status={booking.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminSectionCard title="Details" className="lg:col-span-2">
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-[#212529]">{booking.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-[#212529]">
                {booking.phoneNumber || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-medium capitalize text-[#212529]">
                {booking.typeLabel}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Reason</dt>
              <dd className="font-medium text-[#212529]">
                {booking.reason || "—"}
              </dd>
            </div>
          </dl>

          {booking.kind === "consultation" ? (
            <div className="mt-6 space-y-2">
              <label className="text-sm text-gray-600">Google Meet link</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
                <Button
                  className="bg-green-700 hover:bg-green-600"
                  onClick={saveMeetLink}
                >
                  Save link
                </Button>
              </div>
              {booking.fileName ? (
                <p className="text-sm text-gray-600">
                  Attachment:{" "}
                  {booking.fileUrl ? (
                    <a
                      href={booking.fileUrl}
                      className="text-green-700 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {booking.fileName}
                    </a>
                  ) : (
                    booking.fileName
                  )}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 space-y-2">
            <label className="text-sm text-gray-600">Internal notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
              placeholder="Notes visible to platform staff only"
            />
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Actions">
          <div className="flex flex-col gap-2">
            {booking.status === "pending" ? (
              <>
                <Button
                  className="bg-green-700 hover:bg-green-600"
                  onClick={() => setStatus("confirmed")}
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStatus("cancelled")}
                >
                  Cancel
                </Button>
              </>
            ) : null}
            {booking.status === "confirmed" ? (
              <Button
                className="bg-green-700 hover:bg-green-600"
                onClick={() => setStatus("completed")}
              >
                Mark completed
              </Button>
            ) : null}
            <Button asChild variant="ghost">
              <Link href="/admin-dashboard/bookings">Back to list</Link>
            </Button>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
