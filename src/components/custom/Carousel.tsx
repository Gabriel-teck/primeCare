"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { carouselItems } from "@/data/simpledata";
import { ArrowLeft, ArrowRight } from "lucide-react";

const itemsPerView = 5;

export default function CustomCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) =>
        prev + itemsPerView >= carouselItems.length ? 0 : prev + itemsPerView
      );
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handlePrev = () => {
    stopAutoPlay();
    setCurrentIndex((prev) =>
      prev - itemsPerView < 0
        ? carouselItems.length - itemsPerView
        : prev - itemsPerView
    );
    startAutoPlay();
  };

  const handleNext = () => {
    stopAutoPlay();
    setCurrentIndex((prev) =>
      prev + itemsPerView >= carouselItems.length ? 0 : prev + itemsPerView
    );
    startAutoPlay();
  };

  // Dynamically slice items based on screen size
  const getVisibleItems = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return [carouselItems[currentIndex]]; // Show only one on mobile
    }
    return carouselItems.slice(currentIndex, currentIndex + 5); // Show 5 on desktop
  };

  const visibleItems = getVisibleItems();

  return (
    <div className="relative w-full px-4">
      {/* Mobile Nav Buttons */}
      <div className="flex justify-between md:hidden mt-4 mb-2">
        <button
          onClick={handlePrev}
          className="bg-green-100 text-green-400 px-3 py-2 rounded"
        >
          <ArrowLeft />
        </button>
        <button
          onClick={handleNext}
          className="bg-green-100 text-green-400 px-3 py-2 rounded"
        >
          <ArrowRight />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 transition-all duration-500">
        {visibleItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col justify-center items-center bg-white border rounded-lg shadow p-4 text-center hover:shadow-md curso-green-100"
          >
            <div className="mb-3">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={100}
                height={100}
                className="object-cover rounded"
              />
            </div>
            <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {/*sm: prev and Next icons */}
      <button
        onClick={handlePrev}
        className="px-3 py-2 bg-green-100 text-green-400 rounded hover:bg-gray-600 hidden md:flex absolute left-0 top-1/2 -translate-y-1/2"
      >
        <ArrowLeft />
      </button>
      <button
        onClick={handleNext}
        className="px-3 py-2 bg-green-100 text-green-400 rounded hover:bg-gray-600 hidden md:flex absolute right-0 top-1/2 -translate-y-1/2"
      >
        <ArrowRight />
      </button>
    </div>
  );
}
