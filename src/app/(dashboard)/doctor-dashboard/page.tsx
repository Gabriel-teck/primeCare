"use client";

import { useMemo } from "react";
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
import {
  mockAdminDmMessages,
  mockDoctorBookings,
  mockPatientThreads,
} from "@/lib/doctor/mock-data";

export default function DoctorOverviewPage() {
  const { user } = useAuth();
  const today = "2026-07-28";

  const pending = useMemo(
    () => mockDoctorBookings.filter((b) => b.status === "pending"),
    [],
  );
  const todayRows = useMemo(
    () =>
      mockDoctorBookings
        .filter((b) => b.date === today)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [today],
  );
  const unreadPatient = useMemo(
    () =>
      mockPatientThreads.reduce(
        (sum, t) =>
          sum +
          t.messages.filter((m) => !m.read && m.senderRole === "patient")
            .length,
        0,
      ),
    [],
  );
  const unreadAdmin = useMemo(
    () =>
      mockAdminDmMessages.filter(
        (m) => !m.read && m.senderRole === "super_admin",
      ).length,
    [],
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
          label="Unread patient msgs"
          value={unreadPatient}
          hint="Patient inbox"
          icon={MessageSquare}
        />
        <AdminStatCard
          label="Unread admin msgs"
          value={unreadAdmin}
          hint="Platform admin"
          icon={Users}
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
              href="/doctor-dashboard/schedule?status=pending"
              label="Confirm bookings"
              count={pending.length}
            />
            <QueueLink
              href="/doctor-dashboard/messages?tab=patients"
              label="Patient messages"
              count={unreadPatient}
            />
            <QueueLink
              href="/doctor-dashboard/messages?tab=admin"
              label="Admin messages"
              count={unreadAdmin}
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
                  key={row.id}
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
