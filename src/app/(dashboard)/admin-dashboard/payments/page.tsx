"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { listPayments, updatePayment } from "@/lib/api/payments";
import type { Payment } from "@/types";
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

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <PaymentsContent />
    </Suspense>
  );
}

function PaymentsContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const syncUrl = useCallback(
    (next: { status: string; search: string }) => {
      const params = new URLSearchParams();
      if (next.status && next.status !== "all")
        params.set("status", next.status);
      if (next.search.trim()) params.set("search", next.search.trim());
      const qs = params.toString();
      router.replace(
        qs ? `/admin-dashboard/payments?${qs}` : "/admin-dashboard/payments",
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
      const payments = await listPayments(token, {
        search: debouncedSearch,
        status,
      });
      setRows(payments || []);
    } catch {
      toast.error("Failed to load payments");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleEntitlement = async (row: Payment) => {
    if (!token) return;
    setBusyId(row.id);
    try {
      const updated = await updatePayment(
        row.id,
        { chatEntitled: !row.chatEntitled },
        token,
      );
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, chatEntitled: updated.chatEntitled } : r,
        ),
      );
      toast.success(
        updated.chatEntitled ? "Chat access enabled" : "Chat access disabled",
      );
    } catch {
      toast.error("Could not update chat access");
    } finally {
      setBusyId(null);
    }
  };

  const isFiltering = search !== debouncedSearch || loading;

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
        rows={rows}
        rowKey={(row) => row.id}
        loading={isFiltering}
        emptyMessage="No payments found."
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
                disabled={busyId === row.id}
                onClick={() => toggleEntitlement(row)}
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
