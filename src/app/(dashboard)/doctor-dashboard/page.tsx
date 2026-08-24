"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MessageSquare,
  Users,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { getUnreadCount } from "@/lib/api/chat";
import { getDoctorAppointments } from "@/lib/api/appointment";
import { getDoctorConsultations } from "@/lib/api/consultation";
import { mapDoctorBookings } from "@/lib/doctor/bookings";
import { CallTestPanel } from "@/components/calls/CallTestPanel";
import type { AdminBooking } from "@/lib/admin/types";

export default function DoctorOverviewPage() {
  const { user, token } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [rows, setRows] = useState<AdminBooking[]>([]);

  useEffect(() => {
    if (!token) return;
    getUnreadCount(token)
      .then((res) => setUnreadTotal(res?.count ?? 0))
      .catch(() => setUnreadTotal(0));

    Promise.all([getDoctorAppointments(token), getDoctorConsultations(token)])
      .then(([appts, consults]) =>
        setRows(mapDoctorBookings(appts || [], consults || [])),
      )
      .catch(() => setRows([]));
  }, [token]);

  const pending = useMemo(
    () => rows.filter((b) => b.status === "pending"),
    [rows],
  );
  const todayRows = useMemo(
    () =>
      rows
        .filter((b) => b.date === today)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [rows, today],
  );

  return (
    <div>
      <AdminPageHeader
        title={`Welcome${user?.fullName ? `, ${user.fullName}` : ""}`}
        description="Your clinical workspace for schedule, patients, and messages."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Pending bookings"
          value={pending.length}
          hint="Awaiting your confirmation"
          icon={Clock}
        />
        <AdminStatCard
          label="Today's schedule"
          value={todayRows.length}
          hint={today}
          icon={Calendar}
        />
        <AdminStatCard
          label="Unread messages"
          value={unreadTotal}
          hint="Patient & admin inbox"
          icon={MessageSquare}
        />
        <AdminStatCard
          label="Open chats"
          value={unreadTotal > 0 ? "Needs reply" : "Clear"}
          hint="Message center"
          icon={Users}
        />
      </div>

      <CallTestPanel role="doctor" className="mb-6" />

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminSectionCard
          title="Action queues"
          description="Items that need your attention"
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            <QueueLink
              href="/doctor-dashboard/schedule?status=pending"
              label="Confirm bookings"
              count={pending.length}
            />
            <QueueLink
              href="/doctor-dashboard/messages?tab=patients"
              label="Patient messages"
              count={unreadTotal}
            />
            <QueueLink
              href="/doctor-dashboard/messages?tab=admin"
              label="Admin messages"
              count={0}
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
              <Link href="/doctor-dashboard/schedule">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          }
        >
          {todayRows.length === 0 ? (
            <p className="text-sm text-gray-500">
              No bookings scheduled for today.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {todayRows.map((row) => (
                <li
                  key={`${row.kind}-${row.id}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#212529]">
                      {row.fullName}
                    </p>
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
