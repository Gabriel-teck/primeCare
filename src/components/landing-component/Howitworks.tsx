"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { steps } from "@/data/simpledata";

const AUTO_ADVANCE_MS = 4000;

export default function Howitworks() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const currentStep = steps[currentIndex];

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % steps.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="flex flex-col gap-4 bg-[#f6fafd] p-6 lg:flex-row lg:p-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image and title */}
      <div className="w-full lg:w-[40%]">
        <div key={currentStep.id} className="animate-howitworks-fade">
          <h3 className="text-[24px] font-bold text-[#333333]">
            {currentStep.title}
          </h3>
          <Image
            src={currentStep.btnImage}
            alt={currentStep.title}
            width={445}
            height={600}
            className="rounded-md object-cover shadow"
          />
        </div>
      </div>

      {/* Step selector */}
      <div className="w-full lg:w-[60%]">
        {steps.map((step, index) => (
          <div
            key={step.id}
            onClick={() => handleSelect(index)}
            className={`flex cursor-pointer gap-4 p-8 transition-all duration-500 ease-in-out md:p-10 ${
              currentStep.id === step.id
                ? "bg-[#35965e] text-white"
                : "bg-white text-[#333333] hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:gap-6 lg:flex-row lg:gap-6">
              <div
                className={`mb-1 flex h-10 w-10 items-center justify-center rounded-full border p-8 text-lg font-bold md:p-12 ${
                  currentStep.id === step.id
                    ? "border-white/40 bg-white/20 text-white"
                    : "border-gray-300 bg-gray-100 text-gray-500"
                }`}
              >
                {step.id.toString().padStart(2, "0")}
              </div>
              <div>
                <h3 className="text-[16px] font-bold">{step.title}</h3>
                <p className="text-[14px] font-normal leading-6">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
