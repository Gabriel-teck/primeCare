"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CreditCard,
  MessageSquare,
  Users,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllAppointments } from "@/lib/api/appointment";
import { getAllConsultations } from "@/lib/api/consultation";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { mockDoctorThreads, mockPayments } from "@/lib/admin/mock-data";
import { getActiveDoctors } from "@/lib/admin/mock-staff";

type BookingRow = {
  id: string;
  fullName: string;
  date: string;
  time: string;
  status: string;
  kind: "appointment" | "consultation";
};

export default function AdminOverviewPage() {
  const { user, token } = useAuth();
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const [appts, consults] = await Promise.all([
          getAllAppointments(token),
          getAllConsultations(token),
        ]);
        const mapped: BookingRow[] = [
          ...(appts || []).map((a) => ({
            id: a.id,
            fullName: a.fullName,
            date: a.date,
            time: a.time,
            status: String(a.status),
            kind: "appointment" as const,
          })),
          ...(consults || []).map((c) => ({
            id: c.id,
            fullName: c.fullName,
            date: c.date,
            time: c.time,
            status: String(c.status),
            kind: "consultation" as const,
          })),
        ];
        setRows(mapped);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token]);

  const today = new Date().toISOString().split("T")[0];
  const pending = rows.filter((r) => r.status === "pending");
  const todayRows = rows
    .filter((r) => r.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const uniquePatients = new Set(rows.map((r) => r.fullName)).size;
  const unreadDoctorDms = mockDoctorThreads.reduce(
    (sum, t) =>
      sum +
      t.messages.filter((m) => !m.read && m.senderRole === "doctor").length,
    0,
  );
  const failedPayments = mockPayments.filter(
    (p) => p.status === "failed",
  ).length;
  const completedRate = useMemo(() => {
    if (!rows.length) return "—";
    const done = rows.filter((r) => r.status === "completed").length;
    return `${Math.round((done / rows.length) * 100)}%`;
  }, [rows]);

  return (
    <div>
      <AdminPageHeader
        title={`Welcome${user?.fullName ? `, ${user.fullName}` : ""}`}
        description="Platform command center for PrimeCare operations."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Pending bookings"
          value={loading ? "…" : pending.length}
          hint="Awaiting confirmation"
          icon={Clock}
        />
        <AdminStatCard
          label="Today's schedule"
          value={loading ? "…" : todayRows.length}
          hint={today}
          icon={Calendar}
        />
        <AdminStatCard
          label="Unread doctor DMs"
          value={unreadDoctorDms}
          hint={`${getActiveDoctors().length} active doctors`}
          icon={MessageSquare}
        />
        <AdminStatCard
          label="Failed payments"
          value={failedPayments}
          hint={`Completion rate ${completedRate}`}
          icon={CreditCard}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminSectionCard
          title="Action queues"
          description="Items that need your attention"
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            <QueueLink
              href="/admin-dashboard/bookings?status=pending"
              label="Confirm bookings"
              count={pending.length}
            />
            <QueueLink
              href="/admin-dashboard/chat"
              label="Doctor messages"
              count={unreadDoctorDms}
            />
            <QueueLink
              href="/admin-dashboard/payments?status=failed"
              label="Failed payments"
              count={failedPayments}
            />
            <QueueLink
              href="/admin-dashboard/patients"
              label="Patient directory"
              count={uniquePatients}
            />
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Today's schedule"
          description="Appointments and consultations for today"
          className="lg:col-span-2"
          actions={
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-green-700 text-green-700"
            >
              <Link href="/admin-dashboard/bookings">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {loading ? (
            <p className="text-sm text-gray-500">Loading schedule…</p>
          ) : todayRows.length === 0 ? (
            <p className="text-sm text-gray-500">
              No bookings scheduled for today.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todayRows.slice(0, 6).map((row) => (
                <li
                  key={`${row.kind}-${row.id}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium text-[#212529]">{row.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {row.kind} · {row.time}
                    </p>
                  </div>
                  <AdminStatusBadge status={row.status} />
                </li>
              ))}
            </ul>
          )}
        </AdminSectionCard>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink
          href="/admin-dashboard/bookings"
          label="Bookings"
          icon={Calendar}
        />
        <QuickLink
          href="/admin-dashboard/patients"
          label="Patients"
          icon={Users}
        />
        <QuickLink
          href="/admin-dashboard/chat"
          label="Doctor chat"
          icon={MessageSquare}
        />
        <QuickLink
          href="/admin-dashboard/analytics"
          label="Analytics"
          icon={CreditCard}
        />
      </div>
    </div>
  );
}

function QueueLink({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 transition-colors hover:border-green-700 hover:bg-green-50"
    >
      <span className="text-sm text-[#212529]">{label}</span>
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
        {count}
      </span>
    </Link>
  );
}

function QuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof Calendar;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-green-700 hover:bg-green-50"
    >
      <div className="rounded-lg bg-green-50 p-2 text-green-700">
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium text-[#212529]">{label}</span>
    </Link>
  );
}
