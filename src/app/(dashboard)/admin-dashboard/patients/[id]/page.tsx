"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPatientById } from "@/lib/api/user";
import { getAllAppointments } from "@/lib/api/appointment";
import { getAllConsultations } from "@/lib/api/consultation";
import { listPayments } from "@/lib/api/payments";
import type { Payment } from "@/types";
import { AdminSectionCard, AdminStatusBadge } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [p, appts, consults, pays] = await Promise.all([
          getPatientById(params.id, token),
          getAllAppointments(token),
          getAllConsultations(token),
          listPayments(token),
        ]);
        setPatient(p);
        const related = [
          ...(appts || [])
            .filter((a) => a.email?.toLowerCase() === p.email?.toLowerCase())
            .map((a) => ({
              id: a.id,
              kind: "appointment",
              date: a.date,
              status: String(a.status),
            })),
          ...(consults || [])
            .filter((c) => c.email?.toLowerCase() === p.email?.toLowerCase())
            .map((c) => ({
              id: c.id,
              kind: "consultation",
              date: c.date,
              status: String(c.status),
            })),
        ].sort((a, b) => b.date.localeCompare(a.date));
        setHistory(related);
        setPayments(
          (pays || []).filter(
            (pay) => pay.patientEmail?.toLowerCase() === p.email?.toLowerCase(),
          ),
        );
      } catch {
        toast.error("Failed to load patient");
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d884a]" />
      </div>
    );
  }
  if (!patient) {
    return (
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin-dashboard/patients" aria-label="Back to patients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-sm text-gray-500">Patient not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin-dashboard/patients" aria-label="Back to patients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="bg-green-700 hover:bg-green-600 text-white rounded-2xl hover:text-white"
        >
          <a href={`mailto:${patient.email}`}>Email patient</a>
        </Button>
      </div>

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
            <p className="text-sm text-gray-500">No payment records.</p>
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
                      {p.currency} {Number(p.amount).toLocaleString()} ·{" "}
                      {p.method}
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
