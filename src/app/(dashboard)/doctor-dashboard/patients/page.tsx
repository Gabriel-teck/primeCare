"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminDataTable,
  AdminFilterBar,
  AdminPageHeader,
  AdminSearchInput,
} from "@/components/admin";
import { useAuth } from "@/context/AuthContext";
import { getDoctorAppointments } from "@/lib/api/appointment";
import { getDoctorConsultations } from "@/lib/api/consultation";
import { mapDoctorBookings } from "@/lib/doctor/bookings";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { toast } from "sonner";

type PatientRow = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  lastVisit: string;
  bookings: number;
};

export default function DoctorPatientsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebouncedValue(search, 300);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appts, consults] = await Promise.all([
        getDoctorAppointments(token),
        getDoctorConsultations(token),
      ]);
      const bookings = mapDoctorBookings(appts || [], consults || []);
      const byPatient = new Map<string, PatientRow>();

      bookings.forEach((b) => {
        const source =
          (appts || []).find((a) => a.id === b.id) ||
          (consults || []).find((c) => c.id === b.id);
        const patientId =
          (source as { patientId?: string } | undefined)?.patientId || b.email;
        const existing = byPatient.get(patientId);
        if (existing) {
          existing.bookings += 1;
          if (`${b.date}${b.time}` > existing.lastVisit.replace(" · ", "")) {
            existing.lastVisit = `${b.date} · ${b.time}`;
          }
        } else {
          byPatient.set(patientId, {
            id: patientId,
            fullName: b.fullName,
            email: b.email,
            phone: b.phoneNumber,
            lastVisit: `${b.date} · ${b.time}`,
            bookings: 1,
          });
        }
      });

      setRows([...byPatient.values()]);
    } catch {
      toast.error("Failed to load patients");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return rows.filter(
      (p) =>
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q),
    );
  }, [rows, debouncedSearch]);

  const isFiltering = search !== debouncedSearch || loading;

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
        loading={isFiltering}
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
            render: (row) => row.bookings,
          },
        ]}
      />
    </div>
  );
}
