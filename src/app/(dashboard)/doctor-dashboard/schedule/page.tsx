"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminBooking } from "@/lib/admin/types";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminFilterSelect,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  getDoctorAppointments,
  updateAppointment,
} from "@/lib/api/appointment";
import {
  getDoctorConsultations,
  updateConsultation,
} from "@/lib/api/consultation";
import { bookingRouteId, mapDoctorBookings } from "@/lib/doctor/bookings";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function DoctorSchedulePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <DoctorScheduleContent />
    </Suspense>
  );
}

function DoctorScheduleContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [kind, setKind] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appts, consults] = await Promise.all([
        getDoctorAppointments(token),
        getDoctorConsultations(token),
      ]);
      setRows(mapDoctorBookings(appts || [], consults || []));
    } catch {
      toast.error("Failed to load schedule");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return rows
      .filter((row) => {
        const matchesSearch =
          !q ||
          row.fullName.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          (row.reason || "").toLowerCase().includes(q);
        const matchesStatus = status === "all" || row.status === status;
        const matchesKind = kind === "all" || row.kind === kind;
        return matchesSearch && matchesStatus && matchesKind;
      })
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [rows, debouncedSearch, status, kind]);

  const isFiltering = search !== debouncedSearch || loading;

  const updateStatus = async (row: AdminBooking, next: string) => {
    if (!token) return;
    setBusyId(row.id);
    try {
      if (row.kind === "consultation") {
        await updateConsultation(row.id, { status: next }, token);
      } else {
        await updateAppointment(row.id, { status: next }, token);
      }
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)),
      );
      toast.success(`Marked as ${next}`);
    } catch {
      toast.error("Could not update status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Schedule"
        description="Manage appointments and video consultations in one place."
      />

      <AdminFilterBar columns={3}>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search patient, email, reason..."
        />
        <AdminFilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: "All statuses", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
            { label: "Rescheduled", value: "rescheduled" },
          ]}
        />
        <AdminFilterSelect
          label="Type"
          value={kind}
          onChange={setKind}
          options={[
            { label: "All types", value: "all" },
            { label: "Appointments", value: "appointment" },
            { label: "Consultations", value: "consultation" },
          ]}
        />
      </AdminFilterBar>

      <AdminDataTable
        rows={filtered}
        rowKey={(row) => bookingRouteId(row)}
        loading={isFiltering}
        emptyMessage="No bookings found."
        onRowClick={(row) =>
          router.push(`/doctor-dashboard/schedule/${bookingRouteId(row)}`)
        }
        columns={[
          {
            key: "patient",
            header: "Patient",
            render: (row) => (
              <div>
                <p className="font-medium">{row.fullName}</p>
                <p className="text-xs text-gray-500">{row.email}</p>
              </div>
            ),
          },
          {
            key: "when",
            header: "When",
            render: (row) => (
              <span className="whitespace-nowrap">
                {row.date} · {row.time}
              </span>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (row) => (
              <span className="capitalize">
                {row.kind}
                <span className="block text-xs text-gray-500">
                  {row.typeLabel}
                </span>
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <AdminStatusBadge status={row.status} />,
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div
                className="flex flex-wrap gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {row.status === "pending" ? (
                  <Button
                    size="sm"
                    className="h-7 bg-green-700 px-2 text-xs hover:bg-green-600"
                    disabled={busyId === row.id}
                    onClick={() => void updateStatus(row, "confirmed")}
                  >
                    Confirm
                  </Button>
                ) : null}
                {row.status === "confirmed" || row.status === "pending" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    disabled={busyId === row.id}
                    onClick={() => void updateStatus(row, "completed")}
                  >
                    Complete
                  </Button>
                ) : null}
                {row.status !== "cancelled" && row.status !== "completed" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-red-600"
                    disabled={busyId === row.id}
                    onClick={() => void updateStatus(row, "cancelled")}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
