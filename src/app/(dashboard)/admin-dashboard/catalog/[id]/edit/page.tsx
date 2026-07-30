"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CatalogItemForm } from "@/components/admin/CatalogItemForm";
import { Button } from "@/components/ui/button";
import { getCatalogItem } from "@/lib/api/catalog";
import type { CatalogItem } from "@/types";

export default function AdminCatalogEditPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const row = await getCatalogItem(params.id);
        if (!cancelled) setItem(row);
      } catch {
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d884a]" />
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin-dashboard/catalog" aria-label="Back to catalog">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-sm text-gray-500">Catalog item not found.</p>
      </div>
    );
  }

  return (
    <CatalogItemForm
      mode="edit"
      itemId={item.id}
      initialValues={{
        type: item.type,
        name: item.name,
        description: item.description,
        price: item.price != null ? String(item.price) : "",
        currency: item.currency || "NGN",
        published: item.published,
      }}
    />
  );
}
