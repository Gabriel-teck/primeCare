"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  ConsultationCallActions,
  isConsultationCallable,
} from "@/components/calls/ConsultationCallActions";
import {
  Ban,
  CheckCircle2,
  Eye,
  Loader2,
  MoreVertical,
  CircleCheck,
} from "lucide-react";

export default function DoctorSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Loader2
            className="h-8 w-8 animate-spin text-[#1d884a]"
            aria-label="Loading"
          />
        </div>
      }
    >
      <DoctorScheduleContent />
    </Suspense>
  );
}

function DoctorScheduleContent() {
  const { token, user } = useAuth();
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
        description="Manage appointments and online consultations in one place."
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
            key: "call",
            header: "Call",
            className: "text-center",
            render: (row) => (
              <div
                className="flex justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {row.kind === "consultation" &&
                isConsultationCallable(row.status, user?.id) ? (
                  <ConsultationCallActions
                    consultationId={row.id}
                    enabled
                    size="sm"
                    consultationType={row.typeLabel}
                    remoteName={row.fullName}
                    className="inline-flex flex-wrap justify-center gap-2"
                  />
                ) : (
                  <span className="text-xs text-gray-400">
                    {row.kind === "consultation"
                      ? row.status === "pending"
                        ? "After confirmation"
                        : "—"
                      : "—"}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "w-12",
            render: (row) => {
              const detailHref = `/doctor-dashboard/schedule/${bookingRouteId(row)}`;
              const canConfirm = row.status === "pending";
              const canComplete =
                row.status === "confirmed" || row.status === "pending";
              const canCancel =
                row.status !== "cancelled" && row.status !== "completed";

              return (
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 cursor-pointer text-gray-600 hover:bg-green-50 hover:text-green-700"
                        aria-label="Open actions"
                        disabled={busyId === row.id}
                      >
                        {busyId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer gap-3"
                      >
                        <Link href={detailHref}>
                          <Eye className="h-4 w-4 text-green-700" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      {canConfirm ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer gap-3"
                            onClick={() => void updateStatus(row, "confirmed")}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-700" />
                            Confirm
                          </DropdownMenuItem>
                        </>
                      ) : null}
                      {canComplete ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer gap-3"
                            onClick={() => void updateStatus(row, "completed")}
                          >
                            <CircleCheck className="h-4 w-4 text-green-700" />
                            Complete
                          </DropdownMenuItem>
                        </>
                      ) : null}
                      {canCancel ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer gap-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                            onClick={() => void updateStatus(row, "cancelled")}
                          >
                            <Ban className="h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
}
