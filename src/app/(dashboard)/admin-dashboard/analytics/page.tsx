"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, CreditCard, MessageSquare, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllAppointments } from "@/lib/api/appointment";
import { getAllConsultations } from "@/lib/api/consultation";
import { getUnreadCount } from "@/lib/api/chat";
import { listPayments } from "@/lib/api/payments";
import type { Payment } from "@/types";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
} from "@/components/admin";
import { Button } from "@/components/ui/button";

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [bookingCount, setBookingCount] = useState(0);
  const [dmCount, setDmCount] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [appts, consults, unread, pays] = await Promise.all([
          getAllAppointments(token),
          getAllConsultations(token),
          getUnreadCount(token),
          listPayments(token),
        ]);
        const all = [...(appts || []), ...(consults || [])];
        setBookingCount(all.length);
        setDmCount(unread?.count ?? 0);
        setPayments(pays || []);
        const breakdown: Record<string, number> = {};
        all.forEach((item: { status?: string }) => {
          const key = item.status || "unknown";
          breakdown[key] = (breakdown[key] || 0) + 1;
        });
        setStatusBreakdown(breakdown);
      } catch {
        setBookingCount(0);
        setDmCount(0);
        setPayments([]);
      }
    };
    void load();
  }, [token]);

  const paidRevenue = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments],
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
          label="Unread messages"
          value={dmCount}
          icon={MessageSquare}
        />
        <AdminStatCard
          label="Paid revenue"
          value={`NGN ${paidRevenue.toLocaleString()}`}
          icon={CreditCard}
        />
        <AdminStatCard
          label="Payment records"
          value={payments.length}
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
