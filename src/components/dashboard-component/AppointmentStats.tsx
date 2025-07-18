// import { useAppointment } from "@/context/AppointmentContext";
// import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";

// export default function AppointmentStats() {
//   const { appointments } = useAppointment();
//   const upcoming = appointments.filter(
//     (appointment) => appointment.status === "upcoming"
//   ).length;
//   const completed = appointments.filter(
//     (appointment) =>
//       appointment.status === "completed" || appointment.status === "confirmed"
//   ).length;
//   const cancelled = appointments.filter(
//     (appointment) => appointment.status === "cancelled"
//   ).length;
//   const thisMonth = appointments.filter(
//     (appointment) =>
//       new Date(appointment.date).getMonth() === new Date().getMonth()
//   ).length;

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//       <StatCard
//         label="Upcoming Appointments"
//         value={upcoming}
//         icon={<Clock className="h-6 w-6 text-blue-600" />}
//         color="text-blue-600"
//       />
//       <StatCard
//         label="Completed Appointments"
//         value={completed}
//         icon={<CheckCircle className="h-6 w-6 text-green-600" />}
//         color="text-green-600"
//       />
//       <StatCard
//         label="Cancelled Appointments"
//         value={cancelled}
//         icon={<XCircle className="h-6 w-6 text-red-600" />}
//         color="text-red-600"
//       />
//       <StatCard
//         label="This Month Appointments"
//         value={thisMonth}
//         icon={<Calendar className="h-6 w-6 text-orange-600" />}
//         color="text-orange-600"
//       />
//     </div>
//   );
// }

// function StatCard({
//   label,
//   value,
//   icon,
//   color,
// }: {
//   label: string;
//   value: number;
//   icon: React.ReactNode;
//   color: string;
// }) {
//   return (
//     <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
//       <div>
//         <div className={`text-lg font-bold ${color}`}>{value}</div>
//         <div className="text-gray-500 text-sm">{label}</div>
//       </div>
//       <div>{icon}</div>
//     </div>
//   );
// }
