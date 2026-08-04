"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listCatalog } from "@/lib/api/catalog";
import type { CatalogItem } from "@/types";

export default function UrgentCareConditions() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const rows = await listCatalog();
        if (cancelled) return;
        const urgent = (rows || [])
          .filter((row) => row.type === "urgent_care" && row.published)
          .sort((a, b) => a.name.localeCompare(b.name));
        setItems(urgent);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-2 md:gap-x-4 mt-8">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-[50px] border border-[rgb(29,136,74)]/30 bg-gray-100"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-[#828282]">
        Urgent care conditions will appear here soon.
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-2 md:gap-x-4 mt-8">
      {items.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="xl"
          className="bg-[#ffff] text-[16px] font-bold leading-5 text-left text-[rgb(29,136,74)] flex justify-between border-1 border-[rgb(29,136,74)] rounded-[50px] pt-[16px] pr-[20px] pb-[15px] pl-[25px]"
        >
          {item.name}
          <span className="rounded-full bg-green-100 p-0.5">
            <ChevronRight />
          </span>
        </Button>
      ))}
    </div>
  );
}
