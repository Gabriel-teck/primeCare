"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CareServiceDetail from "@/components/landing-component/CareServiceDetail";
import { getCatalogItem } from "@/lib/api/catalog";
import type { CatalogItem } from "@/types";

export default function CareServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const id = params?.id;
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const row = await getCatalogItem(id);
        if (cancelled) return;
        if (!row?.published) {
          setError(true);
          setItem(null);
          return;
        }
        setItem(row);
      } catch {
        if (!cancelled) {
          setError(true);
          setItem(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  if (loading) {
    return (
      <main className="bg-white min-h-[60vh]">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-32">
          <div className="h-4 w-3/4 max-w-xl animate-pulse rounded bg-gray-100" />
          <div className="mt-8 h-10 w-64 animate-pulse rounded bg-gray-100" />
          <div className="mt-3 h-1.5 w-36 animate-pulse rounded bg-gray-100" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="bg-white min-h-[60vh]">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-28 pb-16 md:pt-32">
          <h1 className="text-2xl font-semibold text-[#333]">
            Care service not found
          </h1>
          <p className="mt-3 text-[#666]">
            This care service may have been removed or is no longer available.
          </p>
          <Link
            href="/#care-service"
            className="mt-6 inline-block font-semibold text-[#1d884a] hover:underline"
          >
            Back to care services
          </Link>
        </div>
      </main>
    );
  }

  return <CareServiceDetail item={item} />;
}
