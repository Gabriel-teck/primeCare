"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllAppointments, updateAppointment } from "@/lib/api/appointment";
import {
  getAllConsultations,
  updateConsultation,
} from "@/lib/api/consultation";
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
import { Suspense } from "react";

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <AdminBookingsContent />
    </Suspense>
  );
}

function AdminBookingsContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [kind, setKind] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appts, consults] = await Promise.all([
        getAllAppointments(token),
        getAllConsultations(token),
      ]);
      const mapped: AdminBooking[] = [
        ...(appts || []).map((a: Record<string, string>) => ({
          id: a.id,
          fullName: a.fullName,
          email: a.email,
          phoneNumber: a.phoneNumber,
          date: a.date,
          time: a.time,
          status: a.status,
          reason: a.reason,
          kind: "appointment" as const,
          typeLabel: a.appointmentType || "appointment",
        })),
        ...(consults || []).map((c: Record<string, string>) => ({
          id: c.id,
          fullName: c.fullName,
          email: c.email,
          phoneNumber: c.phoneNumber,
          date: c.date,
          time: c.time,
          status: c.status,
          reason: c.reason,
          kind: "consultation" as const,
          typeLabel: c.consultationType || "consultation",
          googleMeetLink: c.googleMeetLink,
          fileName: c.fileName,
          fileUrl: c.fileUrl,
        })),
      ].sort((a, b) =>
        `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
      );
      setRows(mapped);
    } catch {
      toast.error("Failed to load bookings");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        row.fullName.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.reason?.toLowerCase().includes(q);
      const matchesStatus = status === "all" || row.status === status;
      const matchesKind = kind === "all" || row.kind === kind;
      return matchesSearch && matchesStatus && matchesKind;
    });
  }, [rows, search, status, kind]);

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
        title="Bookings"
        description="Manage appointments and consultations across the platform."
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
        rowKey={(row) => `${row.kind}-${row.id}`}
        emptyMessage={loading ? "Loading bookings..." : "No bookings found."}
        onRowClick={(row) =>
          router.push(`/admin-dashboard/bookings/${row.kind}-${row.id}`)
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
              <span>
                {row.date} · {row.time}
              </span>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (row) => (
              <span className="capitalize">
                {row.kind} · {row.typeLabel}
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
                  <>
                    <Button
                      size="sm"
                      className="bg-green-700 hover:bg-green-600"
                      disabled={busyId === row.id}
                      onClick={() => updateStatus(row, "confirmed")}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === row.id}
                      onClick={() => updateStatus(row, "cancelled")}
                    >
                      Cancel
                    </Button>
                  </>
                ) : null}
                {row.status === "confirmed" ? (
                  <Button
                    size="sm"
                    className="bg-green-700 hover:bg-green-600"
                    disabled={busyId === row.id}
                    onClick={() => updateStatus(row, "completed")}
                  >
                    Complete
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
