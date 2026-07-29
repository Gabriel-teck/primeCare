"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { listBookings } from "@/lib/api/bookings";
import { updateAppointment } from "@/lib/api/appointment";
import { updateConsultation } from "@/lib/api/consultation";
import type { AdminBooking } from "@/lib/admin/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [kind, setKind] = useState(searchParams.get("type") || "all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const syncUrl = useCallback(
    (next: { status: string; type: string; search: string }) => {
      const params = new URLSearchParams();
      if (next.status && next.status !== "all")
        params.set("status", next.status);
      if (next.type && next.type !== "all") params.set("type", next.type);
      if (next.search.trim()) params.set("search", next.search.trim());
      const qs = params.toString();
      router.replace(
        qs ? `/admin-dashboard/bookings?${qs}` : "/admin-dashboard/bookings",
      );
    },
    [router],
  );

  useEffect(() => {
    syncUrl({ status, type: kind, search: debouncedSearch });
  }, [status, kind, debouncedSearch, syncUrl]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await listBookings(token, {
        status,
        type: kind,
        search: debouncedSearch,
      });
      setRows(data || []);
    } catch {
      toast.error("Failed to load bookings");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, status, kind, debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const isFiltering = search !== debouncedSearch || loading;

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
          placeholder="Search by patient name and email"
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
        rows={rows}
        rowKey={(row) => `${row.kind}-${row.id}`}
        loading={isFiltering}
        emptyMessage="No bookings found."
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
