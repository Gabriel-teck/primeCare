"use client";

import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import {
  getMyConsultations,
  cancelConsultation,
  rescheduleConsultation,
} from "@/lib/api/consultation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminFilterBar, AdminFilterSelect } from "@/components/admin";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  MoreVertical,
  MessageSquare,
  Ban,
  Loader2,
} from "lucide-react";
import {
  ConsultationCallActions,
  isConsultationCallable,
} from "@/components/calls/ConsultationCallActions";

type Consultation = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  consultationType: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  doctorId?: string;
  googleMeetLink?: string;
  fileUrl?: string;
  fileName?: string;
  rescheduleInfo?: { date: string; time: string };
};

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Rescheduled", value: "rescheduled" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function StatusBadge({ status }: { status: string }) {
  let color = "bg-gray-200 text-gray-700";
  let icon = <Clock className="h-4 w-4 inline" />;
  if (status === "pending") {
    color = "bg-blue-100 text-blue-700";
    icon = <Clock className="h-4 w-4 inline" />;
  } else if (status === "confirmed" || status === "completed") {
    color = "bg-green-100 text-green-700";
    icon = <CheckCircle className="h-4 w-4 inline" />;
  } else if (status === "cancelled") {
    color = "bg-red-100 text-red-700";
    icon = <XCircle className="h-4 w-4 inline" />;
  } else if (status === "rescheduled") {
    color = "bg-yellow-100 text-yellow-700";
    icon = <RefreshCcw className="h-4 w-4 inline" />;
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ConsultationHistory() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError("");
    getMyConsultations(token, statusFilter)
      .then(setConsultations)
      .catch((err) => setError(err.message || "Failed to fetch"))
      .finally(() => setLoading(false));
  }, [token, statusFilter]);

  const handleCancel = async (id: string) => {
    setActionLoading(id);
    setError("");
    try {
      await cancelConsultation(id, token);
      if (statusFilter !== "all" && statusFilter !== "cancelled") {
        setConsultations((prev) => prev.filter((c) => c.id !== id));
      } else {
        setConsultations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c)),
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReschedule = async (id: string) => {
    if (!rescheduleForm.date || !rescheduleForm.time) return;
    setActionLoading(id);
    setError("");
    try {
      await rescheduleConsultation(
        id,
        rescheduleForm.date,
        rescheduleForm.time,
        token,
      );
      if (statusFilter !== "all" && statusFilter !== "rescheduled") {
        setConsultations((prev) => prev.filter((c) => c.id !== id));
      } else {
        setConsultations((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: "rescheduled",
                  date: rescheduleForm.date,
                  time: rescheduleForm.time,
                  rescheduleInfo: {
                    date: rescheduleForm.date,
                    time: rescheduleForm.time,
                  },
                }
              : c,
          ),
        );
      }
      setRescheduleId(null);
      setRescheduleForm({ date: "", time: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Reschedule failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg bg-white p-4 shadow">
      <h2 className="mb-2 text-lg font-bold">Online Consultation History</h2>
      <p className="mb-4 text-sm text-gray-500">
        Video and voice visits. For clinic visits, use Appointments.
      </p>

      <AdminFilterBar className="mb-4">
        <AdminFilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
          className="max-w-xs"
        />
      </AdminFilterBar>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-2 text-red-700">
          {error}
        </div>
      )}
      <table className="min-w-[720px] w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Reason</th>
            <th className="w-28 max-w-[7rem] p-2 text-left">File</th>
            <th className="p-2 text-center">Call</th>
            <th className="w-12 p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="py-6 text-center text-gray-500">
                <Loader2
                  className="mx-auto h-5 w-5 animate-spin text-green-700"
                  aria-label="Loading"
                />
              </td>
            </tr>
          ) : consultations.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-6 text-center text-gray-500">
                No online consultations found
                {statusFilter !== "all" ? ` for “${statusFilter}”` : " yet"}.
              </td>
            </tr>
          ) : (
            consultations.map((c) => (
              <Fragment key={c.id}>
                <tr className="border-b last:border-b-0">
                  <td className="p-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {c.rescheduleInfo?.date || c.date}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {c.rescheduleInfo?.time || c.time}
                    </span>
                  </td>
                  <td className="p-2">{c.consultationType}</td>
                  <td className="p-2 ">
                    <StatusBadge status={c.status} />
                    {isConsultationCallable(c.status, c.doctorId) ? (
                      <span className="mt-1 block text-[11px] text-green-700">
                        Call available
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-[160px] truncate p-2">{c.reason}</td>
                  <td className="w-28 max-w-[9rem] p-2">
                    {c.fileName || c.fileUrl ? (
                      <span
                        className="block truncate text-gray-700"
                        title={c.fileName || "Attached file"}
                      >
                        {c.fileName || "Attached file"}
                      </span>
                    ) : (
                      <span className="text-gray-400">No file</span>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {isConsultationCallable(c.status, c.doctorId) ? (
                      <ConsultationCallActions
                        consultationId={c.id}
                        enabled
                        size="sm"
                        consultationType={c.consultationType}
                        className="inline-flex flex-wrap justify-center gap-2"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">
                        {c.status === "pending"
                          ? "After confirmation"
                          : !c.doctorId
                            ? "Awaiting doctor"
                            : "—"}
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 cursor-pointer text-gray-600 hover:bg-green-50 hover:text-green-700"
                          aria-label="Open actions"
                          disabled={actionLoading === c.id}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer gap-3"
                        >
                          <Link href="/patient-dashboard/messages">
                            <MessageSquare className="h-4 w-4 text-green-700" />
                            Message
                          </Link>
                        </DropdownMenuItem>
                        {(c.status === "pending" ||
                          c.status === "rescheduled") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer gap-3"
                              onClick={() => {
                                setRescheduleId(c.id);
                                setRescheduleForm({
                                  date: c.rescheduleInfo?.date || c.date,
                                  time: c.rescheduleInfo?.time || c.time,
                                });
                              }}
                            >
                              <RefreshCcw className="h-4 w-4 text-green-700" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer gap-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                              onClick={() => void handleCancel(c.id)}
                            >
                              <Ban className="h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                {rescheduleId === c.id ? (
                  <tr className="border-b bg-gray-50">
                    <td colSpan={8} className="p-3">
                      <form
                        className="flex flex-col gap-2 sm:flex-row sm:items-end"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void handleReschedule(c.id);
                        }}
                      >
                        <label className="flex flex-col gap-1 text-xs text-gray-600">
                          New date
                          <input
                            type="date"
                            required
                            className="rounded border px-2 py-1.5 text-sm"
                            value={rescheduleForm.date}
                            onChange={(e) =>
                              setRescheduleForm((f) => ({
                                ...f,
                                date: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-xs text-gray-600">
                          New time
                          <input
                            type="time"
                            required
                            className="rounded border px-2 py-1.5 text-sm"
                            value={rescheduleForm.time}
                            onChange={(e) =>
                              setRescheduleForm((f) => ({
                                ...f,
                                time: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <Button
                          size="sm"
                          type="submit"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={actionLoading === c.id}
                        >
                          {actionLoading === c.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() => setRescheduleId(null)}
                          disabled={actionLoading === c.id}
                        >
                          Dismiss
                        </Button>
                      </form>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
