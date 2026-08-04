"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { carouselItems, type CarouselItem } from "@/data/simpledata";
import { listCatalog } from "@/lib/api/catalog";
import { resolveMediaUrl } from "@/lib/api/media";

function normalizeTitle(title: string) {
  return title.trim().toLowerCase();
}

export default function CustomCarousel() {
  const [apiItems, setApiItems] = useState<CarouselItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const rows = await listCatalog();
        if (cancelled) return;
        const staticNames = new Set(
          carouselItems.map((item) => normalizeTitle(item.title)),
        );
        const fromApi = (rows || [])
          .filter(
            (row) =>
              row.type === "specialty" &&
              row.published &&
              Boolean(row.imageUrl) &&
              !staticNames.has(normalizeTitle(row.name)),
          )
          .map((row) => ({
            title: row.name,
            desc: row.description,
            imageUrl: resolveMediaUrl(row.imageUrl),
          }));
        setApiItems(fromApi);
      } catch {
        if (!cancelled) setApiItems([]);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => [...carouselItems, ...apiItems], [apiItems]);
  const loopItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="flex w-max animate-specialty-marquee gap-4 pl-4 hover:[animation-play-state:paused]">
        {loopItems.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="flex w-[260px] shrink-0 flex-col items-center justify-center rounded-lg border bg-white p-4 text-center shadow hover:shadow-md sm:w-[280px]"
          >
            <div className="mb-3">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={100}
                height={100}
                className="rounded object-cover"
                unoptimized={item.imageUrl.startsWith("http")}
              />
            </div>
            <h3 className="mb-1 text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
