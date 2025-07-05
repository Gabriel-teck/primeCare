"use client";

import React, { useState } from "react";
import { Eye, Phone, Mail, ChevronDown, Plus } from "lucide-react";

const statusOptions = [
  { label: "All Patients", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "New", value: "new" },
];

const mockPatients = [
  {
    id: 1,
    name: "Sarah Wilson",
    initials: "SW",
    email: "sarah@example.com",
    phone: "(555) 123-4567",
    age: 40,
    gender: "Female",
    lastVisit: "10/01/2024",
    visits: 15,
    status: "active",
    plan: "premium",
  },
  {
    id: 2,
    name: "Robert Brown",
    initials: "RB",
    email: "robert@example.com",
    phone: "(555) 987-6543",
    age: 46,
    gender: "Male",
    lastVisit: "08/01/2024",
    visits: 28,
    status: "active",
    plan: "family",
  },
  {
    id: 3,
    name: "Emily Davis",
    initials: "ED",
    email: "emily@example.com",
    phone: "(555) 456-7890",
    age: 32,
    gender: "Female",
    lastVisit: "05/01/2024",
    visits: 8,
    status: "active",
    plan: "basic",
  },
  {
    id: 4,
    name: "John Doe",
    initials: "JD",
    email: "john@example.com",
    phone: "(555) 111-2222",
    age: 59,
    gender: "Male",
    lastVisit: "20/12/2023",
    visits: 42,
    status: "inactive",
    plan: "basic",
  },
  {
    id: 5,
    name: "Mike Johnson",
    initials: "MJ",
    email: "mike@example.com",
    phone: "(555) 333-4444",
    age: 37,
    gender: "Male",
    lastVisit: "12/01/2024",
    visits: 3,
    status: "new",
    plan: "basic",
  },
];

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

const summary = [
  { label: "Total Patients", value: 5 },
  { label: "Active Patients", value: 3 },
  { label: "Inactive Patients", value: 1 },
  { label: "New Patients", value: 1 },
];

export default function AdminPatientsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showStatus, setShowStatus] = useState(false);

  // Filter patients by search and status
  const filteredPatients = mockPatients.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.age.toString().includes(q) ||
      p.gender.toLowerCase().includes(q) ||
      p.id.toString().includes(q);
    const matchesStatus = status === "all" ? true : p.status === status;
    return matchesSearch && matchesStatus;
  });

  const handleAddPatient = () => {
    alert("Add New Patient functionality coming soon!");
  };

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
                placeholder="Search patients by name, email, phone, or ID..."
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
                  <th className="py-2 px-3 text-left font-semibold">Contact</th>
                  <th className="py-2 px-3 text-left font-semibold">
                    Age/Gender
                  </th>
                  <th className="py-2 px-3 text-left font-semibold">
                    Last Visit
                  </th>
                  <th className="py-2 px-3 text-left font-semibold">Status</th>
                  <th className="py-2 px-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-500 text-base">
                            {p.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {p.name}
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
                        <div className="text-xs text-gray-500">{p.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">
                          {p.age} years
                        </div>
                        <div className="text-xs text-gray-500">{p.gender}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900">
                          {p.lastVisit}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.visits} visits total
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                              statusBadge[p.status as keyof typeof statusBadge]
                                ?.color
                            }`}
                          >
                            {
                              statusBadge[p.status as keyof typeof statusBadge]
                                ?.label
                            }
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                              planBadge[p.plan as keyof typeof planBadge]?.color
                            }`}
                          >
                            {planBadge[p.plan as keyof typeof planBadge]?.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 flex items-center gap-2">
                        <button
                          className="p-2 rounded hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-green-100"
                          title="Phone"
                        >
                          <Phone className="w-5 h-5 text-green-600" />
                        </button>
                        <button
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
        </div>
      </div>
    </div>
  );
}
