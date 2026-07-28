"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPatientById } from "@/lib/api/user";
import { getAllAppointments } from "@/lib/api/appointment";
import { getAllConsultations } from "@/lib/api/consultation";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { mockPayments } from "@/lib/admin/mock-data";
import { toast } from "sonner";

export default function AdminPatientDetailPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [patient, setPatient] = useState<{
    id: string;
    fullName: string;
    email: string;
    createdAt?: string;
  } | null>(null);
  const [history, setHistory] = useState<
    { id: string; kind: string; date: string; status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [p, appts, consults] = await Promise.all([
          getPatientById(params.id, token),
          getAllAppointments(token),
          getAllConsultations(token),
        ]);
        setPatient(p);
        const related = [
          ...(appts || [])
            .filter(
              (a: { email?: string }) =>
                a.email?.toLowerCase() === p.email?.toLowerCase(),
            )
            .map((a: { id: string; date: string; status: string }) => ({
              id: a.id,
              kind: "appointment",
              date: a.date,
              status: a.status,
            })),
          ...(consults || [])
            .filter(
              (c: { email?: string }) =>
                c.email?.toLowerCase() === p.email?.toLowerCase(),
            )
            .map((c: { id: string; date: string; status: string }) => ({
              id: c.id,
              kind: "consultation",
              date: c.date,
              status: c.status,
            })),
        ].sort((a, b) => b.date.localeCompare(a.date));
        setHistory(related);
      } catch {
        toast.error("Failed to load patient");
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, params.id]);

  if (loading) return <p className="text-sm text-gray-500">Loading patient…</p>;
  if (!patient) {
    return (
      <div>
        <AdminPageHeader title="Patient not found" />
        <Button asChild variant="outline">
          <Link href="/admin-dashboard/patients">Back</Link>
        </Button>
      </div>
    );
  }

  const payments = mockPayments.filter(
    (p) => p.patientEmail.toLowerCase() === patient.email.toLowerCase(),
  );

  return (
    <div>
      <AdminPageHeader
        title={patient.fullName}
        description={patient.email}
        actions={
          <Button
            asChild
            variant="outline"
            className="border-green-700 text-green-700"
          >
            <a href={`mailto:${patient.email}`}>Email patient</a>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminSectionCard title="Profile" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Full name</dt>
              <dd className="font-medium">{patient.fullName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium">{patient.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Joined</dt>
              <dd className="font-medium">
                {patient.createdAt
                  ? new Date(patient.createdAt).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
          </dl>
        </AdminSectionCard>

        <AdminSectionCard title="Booking history" className="lg:col-span-2">
          {history.length === 0 ? (
            <p className="text-sm text-gray-500">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {history.map((item) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium capitalize">{item.kind}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                  <AdminStatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>

        <AdminSectionCard title="Payments" className="lg:col-span-3">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payment records (mock).</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{p.description}</p>
                    <p className="text-xs text-gray-500">
                      {p.currency} {p.amount.toLocaleString()} · {p.method}
                    </p>
                  </div>
                  <AdminStatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>
      </div>
    </div>
  );
}
