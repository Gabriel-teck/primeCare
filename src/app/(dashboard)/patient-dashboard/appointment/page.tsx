type Appointment = {
  doctorName: string;
  date: string;
  action: string;
  status: string;
  fee: number;
  visitSchedule: string;
};

export default function AppointmentPage() {
  const appointments: Appointment[] = [
    {
      doctorName: "Dr. Bamidele",
      date: "2025-06-01",
      action: "View",
      status: "Pending",
      fee: 100,
      visitSchedule: "10:00 AM",
    },
    {
      doctorName: "Dr. Dora",
      date: "2025-06-01",
      action: "View",
      status: "Completed",
      fee: 600,
      visitSchedule: "06:00 PM",
    },
    {
      doctorName: "Dr. Joseph",
      date: "2023-06-01",
      action: "View",
      status: "Cancelled",
      fee: 200,
      visitSchedule: "08:00 AM",
    },
    {
      doctorName: "Dr. Ujunwa",
      date: "2024-06-01",
      action: "View",
      status: "Pending",
      fee: 400,
      visitSchedule: "11:00 AM",
    },
  ];
  return (
    <>
      <div className="overflow-x-auto sm:mt-16">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="border-b-1">
            <tr>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Doctor Name
              </th>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Date
              </th>

              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Visit Schedule
              </th>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Status
              </th>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Fee
              </th>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No Consultations found.
                </td>
              </tr>
            ) : (
              appointments.map((appointment, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0 odd:bg-white even:bg-gray-100"
                >
                  <td className="px-4 py-3">{appointment.doctorName}</td>
                  <td className="px-4 py-3">{appointment.date}</td>
                  <td className="px-4 py-3">{appointment.visitSchedule}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                          appointment.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : ""
                        }
                        ${
                          appointment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : ""
                        }
                        ${
                          appointment.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : ""
                        }
                      `}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">${appointment.fee}</td>
                  <td className="px-4 py-3">
                    <button className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs">
                      {appointment.action}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
