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
import { toast } from "sonner";
import { bookingsForPatient, getPatientById } from "@/lib/doctor/mock-data";

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id || "");
  const patient = getPatientById(id);
  const [notes, setNotes] = useState(patient?.notes || "");

  const bookings = useMemo(
    () => (patient ? bookingsForPatient(patient.email) : []),
    [patient],
  );

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

  return (
    <div>
      <AdminPageHeader
        title={patient.fullName}
        description={patient.email}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/doctor-dashboard/patients")}
            >
              Back
            </Button>
            <Button asChild className="bg-green-700 hover:bg-green-600">
              <Link
                href={`/doctor-dashboard/messages?tab=patients&conversationId=${patient.id}`}
              >
                Message
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminSectionCard title="Contact" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
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
              <dd className="mt-1 text-[#212529]">
                {patient.lastVisit || "—"}
              </dd>
            </div>
          </dl>
        </AdminSectionCard>

        <AdminSectionCard title="Clinical notes" className="lg:col-span-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-28 w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
            placeholder="Add private notes about this patient..."
          />
          <Button
            className="mt-3 bg-green-700 hover:bg-green-600"
            onClick={() => toast.success("Notes saved (mock)")}
          >
            Save notes
          </Button>
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
                  key={b.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium capitalize text-[#212529]">
                      {b.kind} · {b.date} {b.time}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {b.reason || "No reason"}
                    </p>
                    {b.fileName ? (
                      <p className="text-xs text-green-700">{b.fileName}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <AdminStatusBadge status={b.status} />
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/doctor-dashboard/schedule/${b.id}`}>
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
