"use client";

import { useEffect, useState } from "react";
import {
  getMyConsultations,
  cancelConsultation,
  rescheduleConsultation,
} from "@/lib/api/consultation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Download,
} from "lucide-react";


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
  fileUrl?: string;
  fileName?: string;
  rescheduleInfo?: { date: string; time: string };
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getMyConsultations(token)
      .then(setConsultations)
      .catch((err) => setError(err.message || "Failed to fetch"))
      .finally(() => setLoading(false));
  }, [token]);

  // Cancel consultation
  const handleCancel = async (id: string) => {
    setActionLoading(id);
    setError("");
    try {
      await cancelConsultation(id, token);
      setConsultations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "cancelled" } : c))
      );
    } catch (err: any) {
      setError(err.message || "Cancel failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Reschedule consultation
  const handleReschedule = async (id: string) => {
    if (!rescheduleForm.date || !rescheduleForm.time) return;
    setActionLoading(id);
    setError("");
    try {
      await rescheduleConsultation(
        id,
        rescheduleForm.date,
        rescheduleForm.time,
        token
      );
      setConsultations((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "rescheduled",
                rescheduleInfo: {
                  date: rescheduleForm.date,
                  time: rescheduleForm.time,
                },
              }
            : c
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
      <h2 className="text-lg font-bold mb-4">Consultation History</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Time</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Reason</th>
            <th className="p-2 text-left">File</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-500">
                Loading...
              </td>
            </tr>
          ) : consultations.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-500">
                No consultations found.
              </td>
            </tr>
          ) : (
            consultations.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0">
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
                <td className="p-2">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-2">{c.reason}</td>
                <td className="p-2">
                  {c.fileUrl ? (
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-green-700 hover:underline"
                    >
                      <Download className="h-4 w-4" />
                      {c.fileName || "Download"}
                    </a>
                  ) : (
                    <span className="text-gray-400">No file</span>
                  )}
                </td>
                <td className="p-2 flex gap-2">
                  {(c.status === "pending" || c.status === "rescheduled") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200"
                        disabled={actionLoading === c.id}
                        onClick={() => handleCancel(c.id)}
                      >
                        {actionLoading === c.id ? "Cancelling..." : "Cancel"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-200"
                        onClick={() => setRescheduleId(c.id)}
                        disabled={actionLoading === c.id}
                      >
                        Reschedule
                      </Button>
                    </>
                  )}
                  {rescheduleId === c.id && (
                    <form
                      className="flex flex-col sm:flex-row gap-2 mt-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleReschedule(c.id);
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
                        disabled={actionLoading === c.id}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRescheduleId(null)}
                        disabled={actionLoading === c.id}
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
