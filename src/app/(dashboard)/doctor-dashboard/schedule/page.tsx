"use client";

import { Suspense, useMemo, useState } from "react";
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
import { mockDoctorBookings } from "@/lib/doctor/mock-data";

export default function DoctorSchedulePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <DoctorScheduleContent />
    </Suspense>
  );
}

function DoctorScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<AdminBooking[]>(mockDoctorBookings);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [kind, setKind] = useState("all");

  const filtered = useMemo(() => {
    return rows
      .filter((row) => {
        const q = search.toLowerCase();
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
  }, [rows, search, status, kind]);

  const updateStatus = (id: string, next: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: next } : r)),
    );
    toast.success(`Marked as ${next}`);
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
        rowKey={(row) => row.id}
        emptyMessage="No bookings found."
        onRowClick={(row) =>
          router.push(`/doctor-dashboard/schedule/${row.id}`)
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
                    onClick={() => updateStatus(row.id, "confirmed")}
                  >
                    Confirm
                  </Button>
                ) : null}
                {row.status === "confirmed" || row.status === "pending" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => updateStatus(row.id, "completed")}
                  >
                    Complete
                  </Button>
                ) : null}
                {row.status !== "cancelled" && row.status !== "completed" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-red-600"
                    onClick={() => updateStatus(row.id, "cancelled")}
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
