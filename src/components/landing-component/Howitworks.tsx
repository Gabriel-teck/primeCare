"use client";
import Image from "next/image";
import { useState } from "react";
import { steps } from "@/data/simpledata";


export default function Howitworks() {
  const [currentStep, setcurrentStep] = useState(steps[0]);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 p-6 lg:p-12 bg-[#f6fafd] ">
        {/* images and Title*/}
        <div className="w-full lg:w-[40%]">
          <h3 className="text-[#333333] font-bold text-[24px]">
            {currentStep.title}
          </h3>
          <Image
            src={currentStep.btnImage}
            alt="Selected Display"
            width={445}
            height={600}
            className="object-cover rounded-md shadow"
          />
        </div>

        {/* selector div */}
        <div className="w-full lg:w-[60%]">
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => setcurrentStep(step)}
              className={`flex p-8 md:p-10 gap-4 cursor-pointer transition ${
                currentStep.id === step.id
                  ? "bg-[#35965e] text-white"
                  : "bg-white text-[#333333] hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:gap-6 lg:flex-row lg:gap-6">
                <div className="mb-1 p-8 md:p-12 w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg border border-gray-300 bg-gray-100 text-gray-500">
                  {step.id.toString().padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-bold text-[16px]">{step.title}</h3>
                  <p className="text-[14px] font-normal leading-6">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
