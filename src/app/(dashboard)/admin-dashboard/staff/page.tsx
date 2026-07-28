"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminFilterSelect,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { mockStaff } from "@/lib/admin/mock-staff";
import { toast } from "sonner";

export default function AdminStaffPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return mockStaff.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.specialty.toLowerCase().includes(q);
      const matchesRole = role === "all" || s.role === role;
      const matchesStatus =
        status === "all" || (status === "active" ? s.active : !s.active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, role, status]);

  return (
    <div>
      <AdminPageHeader
        title="Staff"
        description="Doctors and support roles across the platform."
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
            { label: "Support", value: "support" },
            { label: "Super admin", value: "super_admin" },
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
        rows={filtered}
        rowKey={(row) => row.id}
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
              <span className="capitalize">{row.role.replace("_", " ")}</span>
            ),
          },
          {
            key: "specialty",
            header: "Specialty",
            render: (row) => row.specialty,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusBadge status={row.active ? "active" : "inactive"} />
            ),
          },
          {
            key: "actions",
            header: "",
            render: (row) =>
              row.role === "doctor" && row.active ? (
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
