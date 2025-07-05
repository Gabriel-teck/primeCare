import Image from "next/image";
import React from "react";
import notiBg from "../../../../public/assets/notiBg.png";


export default function PatientDashboard() {
  // Dummy data for demonstration
  const userName = "Gabriel Udoh";
  const stats = [
    {
      label: "New Consultation Requests",
      value: 0,
      color: "bg-sky-500",
      icon: "/assets/newCons.png",
    },
    {
      label: "New Appointment Requests",
      value: 0,
      color: "bg-orange-400",
      icon: "/assets/upIcon.png",
    },
    {
      label: "Total Completed Consultations",
      value: 0,
      color: "bg-teal-400",
      icon: "/assets/tick.png",
    },
  ];

  return (
    <div className="p-4 md:p-8 sm:mt-12 space-y-8">
      {/* Top stats card */}
      <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8 space-y-6">
        <h2 className="text-[24px] text-[#212529] mb-2">Hi, {userName}</h2>
        <div className="flex flex-col md:flex-row gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`flex-1 rounded-2xl ${stat.color} flex flex-row items-center p-6 min-w-[200px]`}
            >
              <div className="flex flex-col flex-1">
                <span className="text-white text-sm md:text-base font-medium mb-2">
                  {stat.label}
                </span>
                <span className="text-[12px] font-bold text-white">
                  {stat.value}
                </span>
              </div>
              <div className="ml-4">
                <img
                  src={stat.icon}
                  alt="icon"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification card */}
      <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8 flex flex-col md:flex-row items-center md:items-start min-h-[220px] relative overflow-hidden">
        <div className="flex-1 z-10">
          <h3 className="text-[24px] text-[#212529] mb-4">Don't Forget</h3>
          <p className="text-gray-600">No new notifications to note</p>
        </div>
        <div className="w-full md:w-1/3 flex justify-end mt-6 md:mt-0 z-0">
          {/* Image placeholder illustration */}
          <Image
            src={notiBg}
            alt="illustration"
            width={250}
            height={242}
            className="w-40 h-32 md:w-56 md:h-40 object-contain opacity-100"
          />
        </div>
      </div>
    </div>
  );
}
