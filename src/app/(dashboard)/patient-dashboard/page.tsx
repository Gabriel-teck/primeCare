// "use client";

// import Image from "next/image";
// import React from "react";
// import notiBg from "../../../../public/assets/notiBg.png";
// // import AppointmentStats from "@/components/dashboard-component/AppointmentStats";
// // import ConsultationStats from "@/components/dashboard-component/ConsultationStats";
// import { useAuth } from "@/context/AuthContext";

// export default function PatientDashboard() {
//   const {user} = useAuth()

//    if (!user) {
//      // Optionally, you can show a loading spinner or redirect to login
//      return <div>Loading...</div>;
//    }
  

//   return (
//     <div className="p-4 md:p-8 sm:mt-12 space-y-8">
//       <p className="text-[#333] font-bold text-3xl">Welcome Back! {user.fullName}</p>
//       <div>
//         {/* <AppointmentStats />
//         <ConsultationStats /> */}
//       </div>

//       {/* Notification card */}
//       <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8 flex flex-col md:flex-row items-center md:items-start min-h-[220px] relative overflow-hidden">
//         <div className="flex-1 z-10">
//           <h3 className="text-[24px] text-[#212529] mb-4">Don't Forget</h3>
//           <p className="text-gray-600">No new notifications to note</p>
//         </div>
//         <div className="w-full md:w-1/3 flex justify-end mt-6 md:mt-0 z-0">
//           {/* Image placeholder illustration */}
//           <Image
//             src={notiBg}
//             alt="illustration"
//             width={250}
//             height={242}
//             className="w-40 h-32 md:w-56 md:h-40 object-contain opacity-100"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMyAppointments } from "@/lib/api/appointment";
import { getMyConsultations } from "@/lib/api/consultation";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, User, FilePlus } from "lucide-react";
import Link from "next/link";

type Appointment = {
  id: string;
  date: string;
  time: string;
  status: string;
};

type Consultation = {
  id: string;
  date: string;
  time: string;
  status: string;
  consultationType: string;
};

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
   if (!token) return;

   const fetchData = async () => {
     setLoading(true);
     try {
       const [appts, consults] = await Promise.all([
         getMyAppointments(token),
         getMyConsultations(token),
       ]);
       setAppointments(appts || []);
       setConsultations(consults || []);
     } catch (error) {
       console.error("Error fetching data:", error);
     } finally {
       setLoading(false);
     }
   };

   fetchData();
 }, [token]);

  // Find next upcoming appointment/consultation (not cancelled, date in future)
  const now = new Date();
  const getNext = (items: { date: string; time: string; status: string }[]) =>
    items
      .filter(
        (item) =>
          item.status !== "cancelled" &&
          new Date(item.date + "T" + item.time) > now
      )
      .sort(
        (a, b) =>
          new Date(a.date + "T" + a.time).getTime() -
          new Date(b.date + "T" + b.time).getTime()
      )[0];

  const nextAppointment = getNext(appointments);
  const nextConsultation = getNext(consultations);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4 md:p-8 sm:mt-12 space-y-8 bg-gray-50 min-h-screen">
      {/* Welcome & Profile */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-3xl shadow-sm p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1d884a] mb-2">
            Welcome back, {user.fullName}!
          </h1>
          <p className="text-gray-600">
            Your health, your care, your dashboard.
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <User className="w-8 h-8 text-green-700" />
          </div>
          <Link href="/profile">
            <Button
              variant="outline"
              className="border-green-700 text-green-700"
            >
              View Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Appointments */}
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="text-green-700" />
            <span className="font-semibold text-green-700">Appointments</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {loading ? "..." : appointments.length}
          </div>
          <div className="text-gray-500 text-sm">Total booked appointments</div>
          <Link href="/patient-dashboard/appointment">
            <Button size="sm" className="mt-2 bg-green-700 hover:bg-green-600">
              View All
            </Button>
          </Link>
        </div>

        {/* Total Consultations */}
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-green-700" />
            <span className="font-semibold text-green-700">Consultations</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {loading ? "..." : consultations.length}
          </div>
          <div className="text-gray-500 text-sm">
            Total online consultations
          </div>
          <Link href="/patient-dashboard/consultation">
            <Button size="sm" className="mt-2 bg-green-700 hover:bg-green-600">
              View All
            </Button>
          </Link>
        </div>

        {/* Next Appointment */}
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="text-green-700" />
            <span className="font-semibold text-green-700">
              Next Appointment
            </span>
          </div>
          {nextAppointment ? (
            <>
              <div className="font-medium text-gray-800">
                {nextAppointment.date} at {nextAppointment.time}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                Status: {nextAppointment.status}
              </div>
            </>
          ) : (
            <div className="text-gray-400">No upcoming appointment</div>
          )}
          <Link href="/patient-dashboard/appointment">
            <Button
              size="sm"
              variant="outline"
              className="mt-2 border-green-700 text-green-700"
            >
              Book/Reschedule
            </Button>
          </Link>
        </div>

        {/* Next Consultation */}
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-green-700" />
            <span className="font-semibold text-green-700">
              Next Consultation
            </span>
          </div>
          {nextConsultation ? (
            <>
              <div className="font-medium text-gray-800">
                {nextConsultation.date} at {nextConsultation.time}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                Status: {nextConsultation.status}
              </div>
            </>
          ) : (
            <div className="text-gray-400">No upcoming consultation</div>
          )}
          <Link href="/patient-dashboard/consultation">
            <Button
              size="sm"
              variant="outline"
              className="mt-2 border-green-700 text-green-700"
            >
              Book/Reschedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/patient-dashboard/appointment">
          <Button className="w-full bg-green-700 hover:bg-green-600">
            Book Appointment
          </Button>
        </Link>
        <Link href="/patient-dashboard/consultation">
          <Button className="w-full bg-green-700 hover:bg-green-600">
            Book Consultation
          </Button>
        </Link>
        <Link href="/patient-dashboard/messages">
          <Button className="w-full bg-green-700 hover:bg-green-600">
            Start Chat
          </Button>
        </Link>
        <Link href="/patient-dashboard/files">
          <Button className="w-full bg-green-700 hover:bg-green-600">
            Upload Medical File
          </Button>
        </Link>
      </div>
    </div>
  );
}