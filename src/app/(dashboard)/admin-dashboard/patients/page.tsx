"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllPatients } from "@/lib/api/user";
import { getAllAppointments } from "@/lib/api/appointment";
import { getAllConsultations } from "@/lib/api/consultation";
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

type PatientRow = {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
  visits: number;
  lastVisit: string;
  status: "active" | "inactive" | "new";
};

export default function AdminPatientsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const [patients, appts, consults] = await Promise.all([
          getAllPatients(token),
          getAllAppointments(token),
          getAllConsultations(token),
        ]);
        const events = [...(appts || []), ...(consults || [])];
        const mapped: PatientRow[] = (patients || []).map(
          (p: {
            id: string;
            fullName: string;
            email: string;
            createdAt?: string;
          }) => {
            const related = events.filter(
              (e: { email?: string }) =>
                e.email?.toLowerCase() === p.email?.toLowerCase(),
            );
            const last = related
              .map((e: { date?: string }) => e.date || "")
              .sort()
              .at(-1);
            const createdRecently =
              p.createdAt &&
              Date.now() - new Date(p.createdAt).getTime() <
                1000 * 60 * 60 * 24 * 30;
            return {
              id: p.id,
              fullName: p.fullName,
              email: p.email,
              createdAt: p.createdAt,
              visits: related.length,
              lastVisit: last || "—",
              status: related.length
                ? ("active" as const)
                : createdRecently
                  ? ("new" as const)
                  : ("inactive" as const),
            };
          },
        );
        setRows(mapped);
      } catch {
        toast.error("Failed to load patients");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        row.fullName.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q);
      const matchesStatus = status === "all" || row.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  return (
    <div>
      <AdminPageHeader
        title="Patients"
        description="Directory of registered patients on the platform."
        actions={
          <Button
            className="bg-green-700 hover:bg-green-600"
            onClick={() =>
              toast.message("Invite patient — coming with backend overhaul")
            }
          >
            Add patient
          </Button>
        }
      />

      <AdminFilterBar>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email..."
        />
        <AdminFilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "New", value: "new" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
      </AdminFilterBar>

      <AdminDataTable
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage={loading ? "Loading patients..." : "No patients found."}
        onRowClick={(row) => router.push(`/admin-dashboard/patients/${row.id}`)}
        columns={[
          {
            key: "name",
            header: "Patient",
            render: (row) => (
              <div>
                <p className="font-medium">{row.fullName}</p>
                <p className="text-xs text-gray-500">{row.email}</p>
              </div>
            ),
          },
          {
            key: "visits",
            header: "Visits",
            render: (row) => row.visits,
          },
          {
            key: "last",
            header: "Last visit",
            render: (row) => row.lastVisit,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <AdminStatusBadge status={row.status} />,
          },
        ]}
      />
    </div>
  );
}
