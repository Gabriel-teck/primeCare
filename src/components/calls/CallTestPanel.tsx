"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminSectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  getDoctorConsultations,
  getMyConsultations,
  updateConsultation,
} from "@/lib/api/consultation";
import { getErrorMessage } from "@/lib/api/errors";
import type { Consultation } from "@/types";
import {
  ConsultationCallActions,
  isConsultationCallable,
} from "./ConsultationCallActions";

type CallTestPanelProps = {
  role: "patient" | "doctor";
  className?: string;
};

export function CallTestPanel({ role, className }: CallTestPanelProps) {
  const { token } = useAuth();
  const [rows, setRows] = useState<Consultation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) return;
    const load =
      role === "doctor" ? getDoctorConsultations : getMyConsultations;
    setLoading(true);
    load(token)
      .then((data) => {
        const withDoctor = (data || []).filter(
          (c) => c.doctorId && String(c.status).toLowerCase() !== "cancelled",
        );
        setRows(withDoctor);
        setSelectedId((prev) =>
          prev && withDoctor.some((c) => c.id === prev)
            ? prev
            : withDoctor[0]?.id || "",
        );
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [token, role]);

  const selected = useMemo(
    () => rows.find((c) => c.id === selectedId),
    [rows, selectedId],
  );

  const callable = selected
    ? isConsultationCallable(String(selected.status), selected.doctorId)
    : false;

  const confirmSelected = async () => {
    if (!selected || !token) return;
    setConfirming(true);
    try {
      await updateConsultation(selected.id, { status: "confirmed" }, token);
      setRows((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, status: "confirmed" } : c,
        ),
      );
      toast.success("Consultation confirmed — you can call now");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not confirm consultation"));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AdminSectionCard
      title="Test a call"
      description="Start the booked call type on a consultation that has a doctor assigned."
      className={className}
    >
      {loading ? (
        <p className="text-sm text-gray-500">Loading consultations…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">
          {role === "patient"
            ? "Book an online consultation and pick a doctor to enable calling."
            : "No consultations assigned to you yet."}
        </p>
      ) : (
        <div className="space-y-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            {rows.map((c) => (
              <option key={c.id} value={c.id}>
                {c.date} {c.time} · {c.consultationType} · {c.fullName} ·{" "}
                {String(c.status)}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-2">
            {callable ? (
              <ConsultationCallActions
                consultationId={selected!.id}
                enabled
                consultationType={selected!.consultationType}
                remoteName={role === "doctor" ? selected!.fullName : undefined}
              />
            ) : (
              <>
                <p className="text-sm text-amber-700">
                  This consultation must be confirmed before calling.
                </p>
                {role === "doctor" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={confirming}
                    onClick={() => void confirmSelected()}
                  >
                    {confirming ? "Confirming…" : "Confirm now"}
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </AdminSectionCard>
  );
}
