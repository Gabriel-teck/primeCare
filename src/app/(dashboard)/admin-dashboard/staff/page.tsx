"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { listStaff } from "@/lib/api/staff";
import type { StaffMember } from "@/types";
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

export default function AdminStaffPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <AdminStaffContent />
    </Suspense>
  );
}

function AdminStaffContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [role, setRole] = useState(searchParams.get("role") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebouncedValue(search, 300);

  const syncUrl = useCallback(
    (next: { role: string; status: string; search: string }) => {
      const params = new URLSearchParams();
      if (next.role && next.role !== "all") params.set("role", next.role);
      if (next.status && next.status !== "all")
        params.set("status", next.status);
      if (next.search.trim()) params.set("search", next.search.trim());
      const qs = params.toString();
      router.replace(
        qs ? `/admin-dashboard/staff?${qs}` : "/admin-dashboard/staff",
      );
    },
    [router],
  );

  useEffect(() => {
    syncUrl({ role, status, search: debouncedSearch });
  }, [role, status, debouncedSearch, syncUrl]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const staff = await listStaff(token, {
        search: debouncedSearch,
        role,
        status,
      });
      setRows(staff || []);
    } catch {
      toast.error("Failed to load staff");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, role, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const isFiltering = search !== debouncedSearch || loading;

  return (
    <div>
      <AdminPageHeader
        title="Staff"
        description="Doctors and admins across the platform."
        actions={
          <Button
            className="bg-green-700 hover:bg-green-600"
            onClick={() => toast.message("Add staff — UI ready for backend")}
          >
            Add staff
          </Button>
        }
      />

      <AdminFilterBar columns={3}>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search staff..."
        />
        <AdminFilterSelect
          label="Role"
          value={role}
          onChange={setRole}
          options={[
            { label: "All roles", value: "all" },
            { label: "Doctor", value: "doctor" },
            { label: "Admin", value: "admin" },
          ]}
        />
        <AdminFilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />
      </AdminFilterBar>

      <AdminDataTable
        rows={rows}
        rowKey={(row) => row.id}
        loading={isFiltering}
        emptyMessage="No staff found."
        onRowClick={(row) => router.push(`/admin-dashboard/staff/${row.id}`)}
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => (
              <div>
                <p className="font-medium">{row.fullName}</p>
                <p className="text-xs text-gray-500">{row.email}</p>
              </div>
            ),
          },
          {
            key: "role",
            header: "Role",
            render: (row) => (
              <span className="capitalize">{String(row.role)}</span>
            ),
          },
          {
            key: "specialty",
            header: "Specialty",
            render: (row) => row.specialty || "—",
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge
                status={row.active !== false ? "active" : "inactive"}
              />
            ),
          },
          {
            key: "actions",
            header: "",
            render: (row) =>
              row.role === "doctor" && row.active !== false ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-700 text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin-dashboard/chat?doctorId=${row.id}`);
                  }}
                >
                  Message
                </Button>
              ) : null,
          },
        ]}
      />
    </div>
  );
}
