"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllPatients } from "@/lib/api/user";
import type { PatientDirectoryItem } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminFilterSelect,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from "@/components/admin";
import { toast } from "sonner";

export default function AdminPatientsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <AdminPatientsContent />
    </Suspense>
  );
}

function AdminPatientsContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<PatientDirectoryItem[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebouncedValue(search, 300);

  const syncUrl = useCallback(
    (next: { status: string; search: string }) => {
      const params = new URLSearchParams();
      if (next.status && next.status !== "all")
        params.set("status", next.status);
      if (next.search.trim()) params.set("search", next.search.trim());
      const qs = params.toString();
      router.replace(
        qs ? `/admin-dashboard/patients?${qs}` : "/admin-dashboard/patients",
      );
    },
    [router],
  );

  useEffect(() => {
    syncUrl({ status, search: debouncedSearch });
  }, [status, debouncedSearch, syncUrl]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const patients = await getAllPatients(token, {
        search: debouncedSearch,
        status,
      });
      setRows(patients || []);
    } catch {
      toast.error("Failed to load patients");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const isFiltering = search !== debouncedSearch || loading;

  return (
    <div>
      <AdminPageHeader
        title="Manage Patients"
        description="Directory of registered patients on the platform."
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
        rows={rows}
        rowKey={(row) => row.id}
        loading={isFiltering}
        emptyMessage="No patients found."
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
            render: (row) => row.lastVisit || "—",
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
