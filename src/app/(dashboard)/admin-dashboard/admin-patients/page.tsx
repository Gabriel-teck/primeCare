"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  Phone,
  Mail,
  ChevronDown,
  Plus,
  Calendar,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllPatients } from "@/lib/api/user";
import { getAllAppointments } from "@/lib/api/appointment";
import { getAllConsultations } from "@/lib/api/consultation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const statusOptions = [
  { label: "All Patients", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "New", value: "new" },
];

type Patient = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

type Appointment = {
  id: string;
  patientId: string;
  fullName: string;
  email: string;
  date: string;
  status: string;
  createdAt: string;
};

type Consultation = {
  id: string;
  patientId: string;
  fullName: string;
  email: string;
  date: string;
  status: string;
  createdAt: string;
};

type PatientWithStats = Patient & {
  initials: string;
  lastVisit: string;
  totalVisits: number;
  status: "active" | "inactive" | "new";
  plan: "premium" | "family" | "basic";
};

const statusBadge = {
  active: {
    label: "active",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  inactive: {
    label: "inactive",
    color: "bg-red-100 text-red-600 border-red-200",
  },
  new: {
    label: "new",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

const planBadge = {
  premium: {
    label: "premium",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  family: {
    label: "family",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  basic: {
    label: "basic",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

const ITEMS_PER_PAGE = 10;

export default function AdminPatientsPage() {
  const { token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showStatus, setShowStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientsData, appointmentsData, consultationsData] =
          await Promise.all([
            getAllPatients(token),
            getAllAppointments(token),
            getAllConsultations(token),
          ]);
        setPatients(patientsData || []);
        setAppointments(appointmentsData || []);
        setConsultations(consultationsData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Process patients with statistics
  const patientsWithStats: PatientWithStats[] = patients.map((patient) => {
    // Get patient's appointments and consultations
    const patientAppointments = appointments.filter(
      (apt) => apt.email === patient.email
    );
    const patientConsultations = consultations.filter(
      (cons) => cons.email === patient.email
    );

    // Calculate last visit
    const allVisits = [
      ...patientAppointments.map((apt) => ({
        date: apt.date,
        type: "appointment",
      })),
      ...patientConsultations.map((cons) => ({
        date: cons.date,
        type: "consultation",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastVisit = allVisits.length > 0 ? allVisits[0].date : null;
    const totalVisits =
      patientAppointments.length + patientConsultations.length;

    // Determine patient status
    let status: "active" | "inactive" | "new" = "new";
    if (totalVisits > 0) {
      const lastVisitDate = lastVisit ? new Date(lastVisit) : null;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (lastVisitDate && lastVisitDate > thirtyDaysAgo) {
        status = "active";
      } else {
        status = "inactive";
      }
    }

    // Determine plan based on visit frequency
    let plan: "premium" | "family" | "basic" = "basic";
    if (totalVisits > 20) {
      plan = "premium";
    } else if (totalVisits > 10) {
      plan = "family";
    }

    // Generate initials
    const initials = patient.fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      ...patient,
      initials,
      lastVisit: lastVisit
        ? new Date(lastVisit).toLocaleDateString()
        : "No visits",
      totalVisits,
      status,
      plan,
    };
  });

  // Filter patients by search and status
  const filteredPatients = patientsWithStats.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.fullName.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q);
    const matchesStatus = status === "all" ? true : p.status === status;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Calculate summary statistics
  const summary = [
    { label: "Total Patients", value: patientsWithStats.length },
    {
      label: "Active Patients",
      value: patientsWithStats.filter((p) => p.status === "active").length,
    },
    {
      label: "Inactive Patients",
      value: patientsWithStats.filter((p) => p.status === "inactive").length,
    },
    {
      label: "New Patients",
      value: patientsWithStats.filter((p) => p.status === "new").length,
    },
  ];

  const handleAddPatient = () => {
    alert("Add New Patient functionality coming soon!");
  };

  const handleViewPatient = (patientId: string) => {
    alert(`View patient ${patientId} functionality coming soon!`);
  };

  const handleCallPatient = (email: string) => {
    alert(`Call patient at ${email} functionality coming soon!`);
  };

  const handleEmailPatient = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
        <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Patient Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage patient records, medical history, and contact information
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <button
              onClick={handleAddPatient}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" /> Add New Patient
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
          {summary.map((item, idx) => (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center rounded-xl border px-4 py-3 bg-white font-semibold text-gray-700 text-center ${
                idx === 0
                  ? "border-green-600 text-green-700 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Search patients by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>
            <div className="relative w-full md:w-48">
              <button
                type="button"
                onClick={() => setShowStatus((s) => !s)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md border bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                {statusOptions.find((s) => s.value === status)?.label}
                <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
              </button>
              {showStatus && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setStatus(opt.value);
                        setShowStatus(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${
                        status === opt.value
                          ? "bg-green-100 text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredPatients.length)} of{" "}
              {filteredPatients.length} patients
            </span>
            {filteredPatients.length > ITEMS_PER_PAGE && (
              <span>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 px-3 text-left font-semibold">Patient</th>
                  <th className="py-2 px-3 text-left font-semibold">Contact</th>
                  <th className="py-2 px-3 text-left font-semibold">
                    Last Visit
                  </th>
                  <th className="py-2 px-3 text-left font-semibold">Status</th>
                  <th className="py-2 px-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      {filteredPatients.length === 0
                        ? "No patients found."
                        : "No patients on this page."}
                    </td>
                  </tr>
                ) : (
                  currentPatients.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-500 text-base">
                            {p.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {p.fullName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {p.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-900">
                          {p.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          Member since{" "}
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">
                          {p.lastVisit}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.totalVisits} visits total
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                              statusBadge[p.status]?.color
                            }`}
                          >
                            {statusBadge[p.status]?.label}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                              planBadge[p.plan]?.color
                            }`}
                          >
                            {planBadge[p.plan]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <button
                          onClick={() => handleViewPatient(p.id)}
                          className="p-2 rounded hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleCallPatient(p.email)}
                          className="p-2 rounded hover:bg-green-100"
                          title="Phone"
                        >
                          <Phone className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleEmailPatient(p.email)}
                          className="p-2 rounded hover:bg-blue-100"
                          title="Mail"
                        >
                          <Mail className="w-5 h-5 text-blue-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          className={`cursor-pointer ${
                            currentPage === page
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "hover:bg-green-50"
                          }`}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
