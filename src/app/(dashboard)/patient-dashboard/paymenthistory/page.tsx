type PaymentHistory = {
  paymentMethod: string;
  date: string;
  status: string;
  fee: number;
  medicalCondition: string;
};

export default function PaymentHistoryPage() {
  const paymenthistory: PaymentHistory[] = [
    {
      paymentMethod: "Card",
      date: "2025-06-01",
      status: "Pending",
      fee: 100,
      medicalCondition: "10:00 AM",
    },
    {
      paymentMethod: "Bank transfer",
      date: "2025-06-01",
      status: "Pending",
      fee: 600,
      medicalCondition: "06:00 PM",
    },
    {
      paymentMethod: "Card",
      date: "2023-06-01",
      status: "Approved",
      fee: 200,
      medicalCondition: "08:00 AM",
    },
    {
      paymentMethod: "Bank transfer",
      date: "2024-06-01",
      status: "Failed",
      fee: 400,
      medicalCondition: "11:00 AM",
    },
  ];
  return (
    <>
      <div className="overflow-x-auto sm:mt-16">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="border-b-1">
            <tr>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Payment Method
              </th>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Date
              </th>

              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Medical Condition
              </th>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Fee
              </th>
              <th className="px-6 py-8 text-[rgba(0,0,0,0.5)] bg-gray-100 text-left text-[16px] font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paymenthistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No Payment History found.
                </td>
              </tr>
            ) : (
              paymenthistory.map((history, index) => (
                <tr
                  key={index}
                  className="border-b last:border-b-0 odd:bg-white even:bg-gray-100"
                >
                  <td className="px-4 py-3">{history.paymentMethod}</td>
                  <td className="px-4 py-3">{history.date}</td>
                  <td className="px-4 py-3">{history.medicalCondition}</td>

                  <td className="px-4 py-3">${history.fee}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                          history.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : ""
                        }
                        ${
                          history.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : ""
                        }
                        ${
                          history.status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : ""
                        }
                      `}
                    >
                      {history.status}
                    </span>
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
