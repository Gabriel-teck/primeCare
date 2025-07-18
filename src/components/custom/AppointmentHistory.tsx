"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  getMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
} from "@/lib/api/appointment";
import {
  Calendar,
  Clock,
  XCircle,
  CheckCircle,
  RefreshCcw,
} from "lucide-react";

type Appointment = {
  id: string;
  fullName: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  rescheduleInfo?: { date: string; time: string };
};

export default function AppointmentHistory() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch appointments
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getMyAppointments(token)
      .then(setAppointments)
      .catch((err) => setError(err.message || "Failed to fetch"))
      .finally(() => setLoading(false));
  }, [token]);

  // Cancel appointment
  const handleCancel = async (id: string) => {
    setActionLoading(id);
    setError("");
    try {
      await cancelAppointment(id, token);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (err: any) {
      setError(err.message || "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Reschedule appointment
  const handleReschedule = async (id: string) => {
    if (!rescheduleForm.date || !rescheduleForm.time) return;
    setActionLoading(id);
    setError("");
    try {
      await rescheduleAppointment(
        id,
        rescheduleForm.date,
        rescheduleForm.time,
        token
      );
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "rescheduled",
                rescheduleInfo: {
                  date: rescheduleForm.date,
                  time: rescheduleForm.time,
                },
              }
            : a
        )
      );
      setRescheduleId(null);
      setRescheduleForm({ date: "", time: "" });
    } catch (err: any) {
      setError(err.message || "Reschedule failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
      <h2 className="text-lg font-bold mb-4">Appointment History</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Full Name</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Reason</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">
                Loading...
              </td>
            </tr>
          ) : appointments.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">
                No appointments found.
              </td>
            </tr>
          ) : (
            appointments.map((a) => (
              <tr key={a.id} className="border-b last:border-b-0">
                <td className="p-2">{a.fullName}</td>
                <td className="p-2">{a.rescheduleInfo?.date || a.date}</td>
                <td className="p-2">{a.rescheduleInfo?.time || a.time}</td>

                <td className="p-2">
                  <StatusBadge status={a.status} />
                </td>
                <td className="p-2">{a.reason}</td>
                <td className="p-2 flex gap-2">
                  {(a.status === "upcoming" ||
                    a.status === "rescheduled" ||
                    a.status === "pending") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200"
                        disabled={actionLoading === a.id}
                        onClick={() => handleCancel(a.id)}
                      >
                        {actionLoading === a.id ? "Cancelling..." : "Cancel"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200"
                        onClick={() => setRescheduleId(a.id)}
                        disabled={actionLoading === a.id}
                      >
                        Reschedule
                      </Button>
                    </>
                  )}
                  {rescheduleId === a.id && (
                    <form
                      className="flex flex-col sm:flex-row gap-2 mt-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleReschedule(a.id);
                      }}
                    >
                      <input
                        type="date"
                        required
                        className="border rounded px-2 py-1"
                        value={rescheduleForm.date}
                        onChange={(e) =>
                          setRescheduleForm((f) => ({
                            ...f,
                            date: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="time"
                        required
                        className="border rounded px-2 py-1"
                        value={rescheduleForm.time}
                        onChange={(e) =>
                          setRescheduleForm((f) => ({
                            ...f,
                            time: e.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={actionLoading === a.id}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRescheduleId(null)}
                        disabled={actionLoading === a.id}
                      >
                        Cancel
                      </Button>
                    </form>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let color = "bg-gray-200 text-gray-700";
  let icon = <Clock className="h-4 w-4 inline" />;
  if (status === "upcoming") {
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
