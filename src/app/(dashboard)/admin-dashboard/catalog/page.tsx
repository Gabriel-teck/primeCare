"use client";

import { useMemo, useState } from "react";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminFilterSelect,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { mockCatalog } from "@/lib/admin/mock-data";
import { toast } from "sonner";

export default function AdminCatalogPage() {
  const [rows, setRows] = useState(mockCatalog);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q);
      const matchesType = type === "all" || row.type === type;
      return matchesSearch && matchesType;
    });
  }, [rows, search, type]);

  const togglePublished = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, published: !r.published } : r)),
    );
    toast.success("Catalog item updated (mock)");
  };

  return (
    <div>
      <AdminPageHeader
        title="Catalog"
        description="Specialties, urgent-care conditions, and service pricing."
        actions={
          <Button
            className="bg-green-700 hover:bg-green-600"
            onClick={() => toast.message("Add catalog item — coming soon")}
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
              <span className="capitalize">{row.type.replace("_", " ")}</span>
            ),
          },
          {
            key: "price",
            header: "Price",
            render: (row) =>
              row.price != null
                ? `${row.currency} ${row.price.toLocaleString()}`
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
                onClick={() => togglePublished(row.id)}
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
