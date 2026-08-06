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
import { getPatientById } from "@/lib/api/user";
import { getDoctorAppointments } from "@/lib/api/appointment";
import { getDoctorConsultations } from "@/lib/api/consultation";
import { createPatientNote, listPatientNotes } from "@/lib/api/records";
import type { AdminBooking } from "@/lib/admin/types";
import { bookingRouteId, mapDoctorBookings } from "@/lib/doctor/bookings";
import { Loader2, Pencil } from "lucide-react";

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = String(params.id || "");

  const [patient, setPatient] = useState<{
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
  } | null>(null);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [savedNote, setSavedNote] = useState("");
  const [notes, setNotes] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [p, appts, consults, noteRows] = await Promise.all([
          getPatientById(id, token),
          getDoctorAppointments(token),
          getDoctorConsultations(token),
          listPatientNotes(id, token).catch(() => []),
        ]);
        setPatient(p);
        const all = mapDoctorBookings(appts || [], consults || []).filter(
          (b) =>
            b.email.toLowerCase() === p.email.toLowerCase() ||
            (appts || []).some((a) => a.id === b.id && a.patientId === id) ||
            (consults || []).some((c) => c.id === b.id && c.patientId === id),
        );
        setBookings(all);
        const latest = noteRows?.[0]?.body?.trim() || "";
        setSavedNote(latest);
        setNotes(latest);
        setEditingNotes(!latest);
      } catch {
        toast.error("Failed to load patient");
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, id]);

  const lastVisit = useMemo(
    () => (bookings[0] ? `${bookings[0].date} · ${bookings[0].time}` : "—"),
    [bookings],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d884a]" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div>
        <AdminPageHeader title="Patient not found" />
        <Button
          variant="outline"
          onClick={() => router.push("/doctor-dashboard/patients")}
        >
          Back to patients
        </Button>
      </div>
    );
  }

  const saveNotes = async () => {
    if (!token || !notes.trim()) return;
    setSavingNotes(true);
    try {
      await createPatientNote(patient.id, notes.trim(), token);
      const next = notes.trim();
      setSavedNote(next);
      setNotes(next);
      setEditingNotes(false);
      toast.success("Notes saved");
    } catch {
      toast.error("Could not save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const startEditing = () => {
    setNotes(savedNote);
    setEditingNotes(true);
  };

  const cancelEditing = () => {
    setNotes(savedNote);
    setEditingNotes(false);
  };

  const showEditor = editingNotes || !savedNote;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/doctor-dashboard/patients")}
        >
          Back
        </Button>
        <Button asChild className="bg-green-700 hover:bg-green-600">
          <Link
            href={`/doctor-dashboard/messages?tab=patients&patientId=${patient.id}`}
          >
            Message
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminSectionCard title="Contact" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="mt-1 text-[#212529]">{patient.fullName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="mt-1 text-[#212529]">{patient.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="mt-1 text-[#212529]">{patient.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last / next visit</dt>
              <dd className="mt-1 text-[#212529]">{lastVisit}</dd>
            </div>
          </dl>
        </AdminSectionCard>

        <AdminSectionCard
          title="Clinical notes"
          className="lg:col-span-2"
          actions={
            savedNote && !editingNotes ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-gray-600 hover:bg-green-50 hover:text-green-700"
                aria-label="Edit notes"
                onClick={startEditing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null
          }
        >
          {showEditor ? (
            <>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-28 w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
                placeholder="Add private notes about this patient..."
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  className="bg-green-700 hover:bg-green-600"
                  disabled={savingNotes || !notes.trim()}
                  onClick={() => void saveNotes()}
                >
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save notes"
                  )}
                </Button>
                {savedNote ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={savingNotes}
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#212529]">
              {savedNote}
            </p>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          title="Booking history"
          description="Appointments and consultations with you"
          className="lg:col-span-3"
        >
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-500">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <li
                  key={bookingRouteId(b)}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium capitalize text-[#212529]">
                      {b.kind} · {b.date} {b.time}
                    </p>
                    <p
                      className="text-sm text-gray-500"
                      title={b.reason || undefined}
                    >
                      {b.reason
                        ? b.reason.length > 130
                          ? `${b.reason.slice(0, 130)}…`
                          : b.reason
                        : "No reason"}
                    </p>
                    {b.fileName ? (
                      <p className="text-xs text-green-700">{b.fileName}</p>
                    ) : null}
                  </div>
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
