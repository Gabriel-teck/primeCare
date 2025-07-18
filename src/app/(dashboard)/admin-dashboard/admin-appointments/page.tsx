"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  User,
  Calendar,
  ChevronDown,
  AlertTriangle,
  Stethoscope,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllAppointments, updateAppointment } from "@/lib/api/appointment";
import {
  getAllConsultations,
  updateConsultation,
} from "@/lib/api/consultation";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const typeOptions = [
  { label: "All Types", value: "all" },
  { label: "Appointments", value: "appointment" },
  { label: "Consultations", value: "consultation" },
];

type Appointment = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  appointmentType: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Consultation = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  consultationType: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  googleMeetLink?: string;
  createdAt: string;
  updatedAt: string;
};

type CombinedItem = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  type: string;
  typeName: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  fileUrl?: string;
  fileName?: string;
  googleMeetLink?: string;
  createdAt: string;
  updatedAt: string;
  isConsultation: boolean;
};

const statusBadge = {
  confirmed: {
    label: "Confirmed",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle className="w-4 h-4 mr-1" />,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Clock className="w-4 h-4 mr-1" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-600 border-red-200",
    icon: <XCircle className="w-4 h-4 mr-1" />,
  },
  completed: {
    label: "Completed",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: <CheckCircle className="w-4 h-4 mr-1" />,
  },
};

const ITEMS_PER_PAGE = 10;

export default function AdminAppointmentsPage() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [showStatus, setShowStatus] = useState(false);
  const [showType, setShowType] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [appts, consults] = await Promise.all([
          getAllAppointments(token),
          getAllConsultations(token),
        ]);
        setAppointments(appts || []);
        setConsultations(consults || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Combine and format data
  const combinedData: CombinedItem[] = [
    ...appointments.map((apt) => ({
      ...apt,
      type: "appointment",
      typeName: apt.appointmentType,
      isConsultation: false,
    })),
    ...consultations.map((cons) => ({
      ...cons,
      type: "consultation",
      typeName: cons.consultationType,
      isConsultation: true,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Filter data
  const filteredData = combinedData.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.typeName.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q);
    const matchesStatus = status === "all" ? true : item.status === status;
    const matchesType = type === "all" ? true : item.type === type;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Calculate summary statistics
  const summary = [
    { label: "Total", value: combinedData.length },
    {
      label: "Pending",
      value: combinedData.filter((a) => a.status === "pending").length,
    },
    {
      label: "Confirmed",
      value: combinedData.filter((a) => a.status === "confirmed").length,
    },
    {
      label: "Cancelled",
      value: combinedData.filter((a) => a.status === "cancelled").length,
    },
    {
      label: "Completed",
      value: combinedData.filter((a) => a.status === "completed").length,
    },
  ];

  const pendingReviewCount = combinedData.filter(
    (a) => a.status === "pending"
  ).length;

  // Handle status updates
  const handleStatusUpdate = async (item: CombinedItem, newStatus: string) => {
    setActionLoading(item.id);
    try {
      if (item.isConsultation) {
        await updateConsultation(item.id, { status: newStatus }, token);
      } else {
        await updateAppointment(item.id, { status: newStatus }, token);
      }

      // Update local state
      if (item.isConsultation) {
        setConsultations((prev) =>
          prev.map((cons) =>
            cons.id === item.id ? { ...cons, status: newStatus } : cons
          )
        );
      } else {
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === item.id ? { ...apt, status: newStatus } : apt
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      // You might want to show a toast notification here
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

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
              Appointments & Consultations
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage patient appointments and consultations
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            {pendingReviewCount > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full px-3 py-1 border border-yellow-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {pendingReviewCount} Pending Review
              </span>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-2">
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
                placeholder="Search patients, emails, or reasons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            {/* Type Filter */}
            <div className="relative w-full md:w-48">
              <button
                type="button"
                onClick={() => setShowType((s) => !s)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md border bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                {typeOptions.find((t) => t.value === type)?.label}
                <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
              </button>
              {showType && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setType(opt.value);
                        setShowType(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${
                        type === opt.value
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

            {/* Status Filter */}
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

          {/* Table */}
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-2 px-3 text-left font-semibold">Patient</th>
                  <th className="py-2 px-3 text-left font-semibold">Type</th>
                  <th className="py-2 px-3 text-left font-semibold">
                    Date & Time
                  </th>
                  <th className="py-2 px-3 text-left font-semibold">Status</th>
                  <th className="py-2 px-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No appointments or consultations found.
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">
                          {item.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.phoneNumber}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {item.isConsultation ? (
                            <Stethoscope className="w-4 h-4 text-green-600" />
                          ) : (
                            <Calendar className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {item.typeName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-32">
                          {item.reason}
                        </div>
                        {item.fileName && (
                          <div className="flex items-center gap-1 mt-1">
                            <FileText className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {item.fileName}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">
                          {formatDate(item.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(item.time)}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                            statusBadge[item.status as keyof typeof statusBadge]
                              ?.color
                          }`}
                        >
                          {
                            statusBadge[item.status as keyof typeof statusBadge]
                              ?.icon
                          }
                          {
                            statusBadge[item.status as keyof typeof statusBadge]
                              ?.label
                          }
                        </span>
                      </td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <button
                          className="p-2 rounded hover:bg-gray-100"
                          title="View Details"
                          onClick={() => {
                            console.log("View item:", item);
                          }}
                        >
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>

                        {item.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() =>
                                handleStatusUpdate(item, "confirmed")
                              }
                              disabled={actionLoading === item.id}
                            >
                              {actionLoading === item.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() =>
                                handleStatusUpdate(item, "cancelled")
                              }
                              disabled={actionLoading === item.id}
                            >
                              {actionLoading === item.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}

                        {item.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() =>
                              handleStatusUpdate(item, "completed")
                            }
                            disabled={actionLoading === item.id}
                          >
                            {actionLoading === item.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              "Complete"
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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
