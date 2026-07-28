"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminFilterSelect,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { mockPayments } from "@/lib/admin/mock-data";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <PaymentsContent />
    </Suspense>
  );
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [rows, setRows] = useState(mockPayments);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        row.patientName.toLowerCase().includes(q) ||
        row.patientEmail.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q);
      const matchesStatus = status === "all" || row.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const toggleEntitlement = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, chatEntitled: !r.chatEntitled } : r,
      ),
    );
    toast.success("Chat entitlement updated (mock)");
  };

  return (
    <div>
      <AdminPageHeader
        title="Payments"
        description="Transactions and chat access entitlements."
      />

      <AdminFilterBar>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search payments..."
        />
        <AdminFilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: "All", value: "all" },
            { label: "Paid", value: "paid" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
            { label: "Refunded", value: "refunded" },
          ]}
        />
      </AdminFilterBar>

      <AdminDataTable
        rows={filtered}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "patient",
            header: "Patient",
            render: (row) => (
              <div>
                <p className="font-medium">{row.patientName}</p>
                <p className="text-xs text-gray-500">{row.patientEmail}</p>
              </div>
            ),
          },
          {
            key: "desc",
            header: "Description",
            render: (row) => row.description,
          },
          {
            key: "amount",
            header: "Amount",
            render: (row) => `${row.currency} ${row.amount.toLocaleString()}`,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <AdminStatusBadge status={row.status} />,
          },
          {
            key: "chat",
            header: "Chat access",
            render: (row) => (
              <Button
                size="sm"
                variant="outline"
                className="border-green-700 text-green-700"
                onClick={() => toggleEntitlement(row.id)}
              >
                {row.chatEntitled ? "Enabled" : "Disabled"}
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
