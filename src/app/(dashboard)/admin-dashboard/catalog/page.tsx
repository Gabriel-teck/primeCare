"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminFilterSelect,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from "@/components/admin";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import {
  listCatalog,
  updateCatalogItem,
  deleteCatalogItem,
} from "@/lib/api/catalog";
import { resolveMediaUrl } from "@/lib/api/media";
import type { CatalogItem } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Eye, EyeOff, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCatalogPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<CatalogItem[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCatalogItem(deleteTarget.id, token);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Catalog item deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete catalog item");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Catalog"
        description="Specialties, urgent-care conditions, and service pricing."
        actions={
          <Button
            asChild
            className="cursor-pointer rounded-2xl bg-green-700 hover:bg-green-600"
          >
            <Link href="/admin-dashboard/catalog/new">Add item</Link>
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
            className: "w-180",
            render: (row) => {
              const words = row.description.trim().split(/\s+/).filter(Boolean);
              const description =
                words.length > 100
                  ? `${words.slice(0, 100).join(" ")}…`
                  : row.description;
              const thumb = row.imageUrl ? resolveMediaUrl(row.imageUrl) : null;
              return (
                <div className="flex min-w-0 items-start gap-3">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small admin list thumbnail
                    <img
                      src={thumb}
                      alt=""
                      className="mt-0.5 h-10 w-10 shrink-0 rounded object-cover border border-gray-200"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{row.name}</p>
                    <p
                      className="text-xs text-gray-500 line-clamp-2"
                      title={row.description}
                    >
                      {description}
                    </p>
                  </div>
                </div>
              );
            },
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
            header: "Actions",
            className: "w-12",
            render: (row) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-600 hover:bg-green-50 hover:text-green-700 cursor-pointer"
                    aria-label="Open actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild className="cursor-pointer gap-3">
                    <Link href={`/admin-dashboard/catalog/${row.id}/edit`}>
                      <Pencil className="h-4 w-4 text-green-700" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-3 text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={() => setDeleteTarget(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {row.published ? (
                    <DropdownMenuItem
                      className="cursor-pointer gap-3"
                      onClick={() => void togglePublished(row)}
                    >
                      <EyeOff className="h-4 w-4 text-green-700" />
                      Unpublish
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer gap-3"
                      onClick={() => void togglePublished(row)}
                    >
                      <Eye className="h-4 w-4 text-green-700" />
                      Publish
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
        title="Delete catalog item"
        description={
          deleteTarget
            ? `Deleting “${deleteTarget.name}” will permanently remove it from the catalog.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        confirmLoading={deleting}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
