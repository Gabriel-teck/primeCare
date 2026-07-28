"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, CreditCard, MessageSquare, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllAppointments } from "@/lib/api/appointment";
import { getAllConsultations } from "@/lib/api/consultation";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { mockDoctorThreads, mockPayments } from "@/lib/admin/mock-data";

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [bookingCount, setBookingCount] = useState(0);
  const [statusBreakdown, setStatusBreakdown] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [appts, consults] = await Promise.all([
          getAllAppointments(token),
          getAllConsultations(token),
        ]);
        const all = [...(appts || []), ...(consults || [])];
        setBookingCount(all.length);
        const breakdown: Record<string, number> = {};
        all.forEach((item: { status?: string }) => {
          const key = item.status || "unknown";
          breakdown[key] = (breakdown[key] || 0) + 1;
        });
        setStatusBreakdown(breakdown);
      } catch {
        setBookingCount(0);
      }
    };
    void load();
  }, [token]);

  const paidRevenue = useMemo(
    () =>
      mockPayments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0),
    [],
  );
  const dmCount = mockDoctorThreads.reduce(
    (sum, t) => sum + t.messages.length,
    0,
  );

  const exportCsv = () => {
    const lines = [
      "status,count",
      ...Object.entries(statusBreakdown).map(([k, v]) => `${k},${v}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "primecare-booking-status.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Operational snapshot across bookings, messaging, and payments."
        actions={
          <Button
            variant="outline"
            className="border-green-700 text-green-700"
            onClick={exportCsv}
          >
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total bookings"
          value={bookingCount}
          icon={Calendar}
        />
        <AdminStatCard
          label="Doctor DM volume"
          value={dmCount}
          icon={MessageSquare}
        />
        <AdminStatCard
          label="Paid revenue (mock)"
          value={`NGN ${paidRevenue.toLocaleString()}`}
          icon={CreditCard}
        />
        <AdminStatCard
          label="Payment records"
          value={mockPayments.length}
          icon={Users}
        />
      </div>

      <AdminSectionCard title="Booking status breakdown">
        <ul className="space-y-2">
          {Object.keys(statusBreakdown).length === 0 ? (
            <li className="text-sm text-gray-500">No booking data yet.</li>
          ) : (
            Object.entries(statusBreakdown).map(([status, count]) => (
              <li
                key={status}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
              >
                <span className="capitalize text-[#212529]">{status}</span>
                <span className="font-semibold text-green-700">{count}</span>
              </li>
            ))
          )}
        </ul>
      </AdminSectionCard>
    </div>
  );
}
