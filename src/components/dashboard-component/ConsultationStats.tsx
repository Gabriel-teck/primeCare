// import { useConsultation } from "@/context/ConsultationContext";
// import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";

// export default function ConsultationStats() {
//   const { consultations } = useConsultation();
//   const pending = consultations.filter(
//     (consultation) => consultation.status === "pending"
//   ).length;
//   const completed = consultations.filter(
//     (consultation) =>
//       consultation.status === "completed" || consultation.status === "confirmed"
//   ).length;
//   const cancelled = consultations.filter(
//     (consultation) => consultation.status === "cancelled"
//   ).length;
//   const thisMonth = consultations.filter(
//     (consultation) => new Date(consultation.date).getMonth() === new Date().getMonth()
//   ).length;

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//       <StatCard
//         label="Pending Consultations"
//         value={pending}
//         icon={<Clock className="h-6 w-6 text-blue-600" />}
//         color="text-blue-600"
//       />
//       <StatCard
//         label="Completed Consultations"
//         value={completed}
//         icon={<CheckCircle className="h-6 w-6 text-green-600" />}
//         color="text-green-600"
//       />
//       <StatCard
//         label="Cancelled Consultations"
//         value={cancelled}
//         icon={<XCircle className="h-6 w-6 text-red-600" />}
//         color="text-red-600"
//       />
//       <StatCard
//         label="This Month"
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
