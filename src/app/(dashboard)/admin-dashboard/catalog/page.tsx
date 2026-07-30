"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminFilterSelect,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  createCatalogItem,
  listCatalog,
  updateCatalogItem,
} from "@/lib/api/catalog";
import type { CatalogItem } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { toast } from "sonner";

export default function AdminCatalogPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebouncedValue(search, 300);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCatalog();
      setRows(data || []);
    } catch {
      toast.error("Failed to load catalog");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q);
      const matchesType = type === "all" || row.type === type;
      return matchesSearch && matchesType;
    });
  }, [rows, debouncedSearch, type]);

  const isFiltering = search !== debouncedSearch || loading;

  const togglePublished = async (row: CatalogItem) => {
    if (!token) return;
    try {
      const updated = await updateCatalogItem(
        row.id,
        { published: !row.published },
        token,
      );
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      toast.success(updated.published ? "Published" : "Unpublished");
    } catch {
      toast.error("Could not update catalog item");
    }
  };

  const addItem = async () => {
    if (!token) return;
    try {
      const created = await createCatalogItem(
        {
          name: "New catalog item",
          type: "service",
          description: "Describe this service",
          published: false,
        },
        token,
      );
      setRows((prev) => [...prev, created]);
      toast.success("Catalog item created");
    } catch {
      toast.error("Could not create catalog item");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Catalog"
        description="Specialties, urgent-care conditions, and service pricing."
        actions={
          <Button
            className="bg-green-700 hover:bg-green-600 rounded-2xl"
            onClick={() => void addItem()}
          >
            Add item
          </Button>
        }
      />

      <AdminFilterBar>
        <AdminSearchInput value={search} onChange={setSearch} />
        <AdminFilterSelect
          label="Type"
          value={type}
          onChange={setType}
          options={[
            { label: "All", value: "all" },
            { label: "Specialty", value: "specialty" },
            { label: "Urgent care", value: "urgent_care" },
            { label: "Service", value: "service" },
          ]}
        />
      </AdminFilterBar>

      <AdminDataTable
        rows={filtered}
        rowKey={(row) => row.id}
        loading={isFiltering}
        emptyMessage="No catalog items found."
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => (
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-gray-500">{row.description}</p>
              </div>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (row) => (
              <span className="capitalize">
                {String(row.type).replace("_", " ")}
              </span>
            ),
          },
          {
            key: "price",
            header: "Price",
            render: (row) =>
              row.price != null
                ? `${row.currency || "NGN"} ${Number(row.price).toLocaleString()}`
                : "—",
          },
          {
            key: "status",
            header: "Visibility",
            render: (row) => (
              <AdminStatusBadge
                status={row.published ? "published" : "draft"}
              />
            ),
          },
          {
            key: "actions",
            header: "",
            render: (row) => (
              <Button
                size="sm"
                variant="outline"
                className="border-green-700 text-green-700"
                onClick={() => void togglePublished(row)}
              >
                {row.published ? "Unpublish" : "Publish"}
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
