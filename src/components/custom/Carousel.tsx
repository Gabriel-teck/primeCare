"use client";

import Image from "next/image";
import { carouselItems } from "@/data/simpledata";

export default function CustomCarousel() {
  const loopItems = [...carouselItems, ...carouselItems];

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
