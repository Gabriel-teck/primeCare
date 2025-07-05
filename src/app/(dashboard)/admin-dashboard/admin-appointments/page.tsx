"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  User,
  Calendar,
  ChevronDown,
} from "lucide-react";

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const mockAppointments = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    type: "Consultation",
    typeColor: "blue",
    date: "15/01/2024",
    time: "10:00 AM",
    status: "confirmed",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    type: "Appointment",
    typeColor: "indigo",
    date: "20/01/2024",
    time: "2:30 PM",
    status: "pending",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    type: "Consultation",
    typeColor: "blue",
    date: "16/01/2024",
    time: "9:00 AM",
    status: "pending",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    type: "Appointment",
    typeColor: "indigo",
    date: "18/01/2024",
    time: "3:00 PM",
    status: "confirmed",
  },
  {
    id: 5,
    name: "Robert Brown",
    email: "robert@example.com",
    type: "Consultation",
    typeColor: "blue",
    date: "22/01/2024",
    time: "11:30 AM",
    status: "cancelled",
  },
];

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

const summary = [
  { label: "Total", value: 5 },
  { label: "Pending", value: 2 },
  { label: "Confirmed", value: 2 },
  { label: "Cancelled", value: 1 },
  { label: "Completed", value: 0 },
];

export default function AdminAppointmentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showStatus, setShowStatus] = useState(false);

  // Filter appointments by search and status
  const filteredAppointments = mockAppointments.filter((appt) => {
    const q = search.toLowerCase();
    const matchesSearch =
      appt.name.toLowerCase().includes(q) ||
      appt.email.toLowerCase().includes(q) ||
      appt.type.toLowerCase().includes(q);
    const matchesStatus = status === "all" ? true : appt.status === status;
    return matchesSearch && matchesStatus;
  });

  const pendingReviewCount = mockAppointments.filter(
    (a) => a.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Appointments
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Manage patient appointments and consultations
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            {pendingReviewCount > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full px-3 py-1 border border-yellow-200">
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
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">
                          {appt.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appt.email}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold bg-${appt.typeColor}-100 text-${appt.typeColor}-700`}
                        >
                          {appt.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">
                          {appt.date}
                        </div>
                        <div className="text-xs text-gray-500">{appt.time}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                            statusBadge[appt.status as keyof typeof statusBadge]
                              ?.color
                          }`}
                        >
                          {
                            statusBadge[appt.status as keyof typeof statusBadge]
                              ?.icon
                          }
                          {
                            statusBadge[appt.status as keyof typeof statusBadge]
                              ?.label
                          }
                        </span>
                      </td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <button
                          className="p-2 rounded hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>
                        {appt.status === "pending" && (
                          <>
                            <button
                              className="p-2 rounded hover:bg-green-100"
                              title="Confirm"
                            >
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </button>
                            <button
                              className="p-2 rounded hover:bg-red-100"
                              title="Cancel"
                            >
                              <XCircle className="w-5 h-5 text-red-600" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
