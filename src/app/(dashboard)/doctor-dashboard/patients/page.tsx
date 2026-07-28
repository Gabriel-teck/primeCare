"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminPageHeader,
  AdminSearchInput,
} from "@/components/admin";
import { mockDoctorPatients, bookingsForPatient } from "@/lib/doctor/mock-data";

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockDoctorPatients.filter(
      (p) =>
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div>
      <AdminPageHeader
        title="Patients"
        description="Patients on your schedule and message threads."
      />

      <AdminFilterBar>
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or phone..."
          className="sm:col-span-2"
        />
      </AdminFilterBar>

      <AdminDataTable
        rows={filtered}
        rowKey={(row) => row.id}
        emptyMessage="No patients found."
        onRowClick={(row) =>
          router.push(`/doctor-dashboard/patients/${row.id}`)
        }
        columns={[
          {
            key: "name",
            header: "Patient",
            render: (row) => (
              <div>
                <p className="font-medium">{row.fullName}</p>
                <p className="text-xs text-gray-500">{row.email}</p>
              </div>
            ),
          },
          {
            key: "phone",
            header: "Phone",
            render: (row) => row.phone || "—",
          },
          {
            key: "lastVisit",
            header: "Last / next",
            render: (row) => row.lastVisit || "—",
          },
          {
            key: "bookings",
            header: "Bookings",
            render: (row) => bookingsForPatient(row.email).length,
          },
        ]}
      />
    </div>
  );
}
