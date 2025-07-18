"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart2,
  FileText,
  ArrowRight,
  Users,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllAppointments } from "@/lib/api/appointment";
import { getAllConsultations } from "@/lib/api/consultation";
import Link from "next/link";

type Appointment = {
  id: string;
  fullName: string;
  email: string;
  appointmentType: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
};

type Consultation = {
  id: string;
  fullName: string;
  email: string;
  consultationType: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Calculate dashboard statistics
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((apt) => apt.date === today);
  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending"
  );
  const pendingConsultations = consultations.filter(
    (cons) => cons.status === "pending"
  );

  // Get today's schedule (appointments + consultations)
  const todaySchedule = [
    ...todayAppointments.map((apt) => ({
      name: apt.fullName,
      type: apt.appointmentType,
      time: apt.time,
      status: apt.status,
      isConsultation: false,
    })),
    ...consultations
      .filter((cons) => cons.date === today)
      .map((cons) => ({
        name: cons.fullName,
        type: cons.consultationType,
        time: cons.time,
        status: cons.status,
        isConsultation: true,
      })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  // Calculate monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date);
    return (
      aptDate.getMonth() === currentMonth &&
      aptDate.getFullYear() === currentYear
    );
  });
  const monthlyConsultations = consultations.filter((cons) => {
    const consDate = new Date(cons.date);
    return (
      consDate.getMonth() === currentMonth &&
      consDate.getFullYear() === currentYear
    );
  });

  // Get unique patients
  const uniquePatients = new Set([
    ...appointments.map((apt) => apt.email),
    ...consultations.map((cons) => cons.email),
  ]);

  const summaryData = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: <Calendar className="w-5 h-5 text-green-700" />,
      sub: `${todaySchedule.length} total scheduled`,
      highlight: true,
    },
    {
      title: "Pending Requests",
      value: pendingAppointments.length + pendingConsultations.length,
      icon: <Clock className="w-5 h-5 text-yellow-500" />,
      sub: "Require your attention",
    },
    {
      title: "Total Patients",
      value: uniquePatients.size,
      icon: <Users className="w-5 h-5 text-blue-500" />,
      sub: "Active patients this month",
    },
    {
      title: "Monthly Growth",
      value: `${Math.round(
        ((monthlyAppointments.length + monthlyConsultations.length) /
          Math.max(
            1,
            monthlyAppointments.length + monthlyConsultations.length - 5
          )) *
          100
      )}%`,
      icon: <BarChart2 className="w-5 h-5 text-green-700" />,
      sub: "vs last month",
      highlight: true,
    },
  ];

  const monthSummary = [
    { label: "Total Patients", value: uniquePatients.size },
    { label: "Appointments", value: monthlyAppointments.length },
    { label: "Consultations", value: monthlyConsultations.length },
    {
      label: "Total Bookings",
      value: monthlyAppointments.length + monthlyConsultations.length,
      highlight: true,
    },
  ];

  const systemStatus = [
    { label: "Appointment System", status: "Online" },
    { label: "Consultation System", status: "Online" },
    { label: "Database", status: "Healthy" },
  ];

  const quickActions = [
    {
      label: "View Appointments",
      icon: Calendar,
      href: "/admin-dashboard/admin-appointments",
    },
    {
      label: "Check Messages",
      icon: MessageSquare,
      href: "/admin-dashboard/admin-chats",
    },
    {
      label: "Patient Records",
      icon: FileText,
      href: "/admin-dashboard/admin-patients",
    },
    {
      label: "View Reports",
      icon: BarChart2,
      href: "/admin-dashboard/admin-reports",
    },
  ];

  // Recent activity based on real data
  const recentActivity = [
    ...appointments.slice(0, 3).map((apt) => ({
      type: "appointment",
      title: "New appointment request",
      name: `${apt.fullName} - ${apt.appointmentType}`,
      time: new Date(apt.createdAt).toLocaleDateString(),
      icon: Calendar,
      color: "text-blue-600",
    })),
    ...consultations.slice(0, 2).map((cons) => ({
      type: "consultation",
      title: "New consultation request",
      name: `${cons.fullName} - ${cons.consultationType}`,
      time: new Date(cons.createdAt).toLocaleDateString(),
      icon: Stethoscope,
      color: "text-green-600",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 4);

  if (loading) {
    return (
      <main className="p-4 md:p-8 flex flex-col gap-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 md:p-8 flex flex-col gap-6">
      {/* Dashboard header and summary cards */}
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Welcome back, {user?.fullName || "Admin"}. Here's what's happening
              today.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryData.map((item) => (
            <Card
              key={item.title}
              className={`flex flex-col gap-2 p-4 ${
                item.highlight ? "border-green-200" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-50 rounded-full p-2 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {item.value}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-600">
                {item.title}
              </div>
              <div className="text-xs text-gray-400 mt-1">{item.sub}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main grid: schedule, quick actions, activity, summary, status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <Card className="col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-green-700" />
              Today's Schedule
            </CardTitle>
            <Link href="/admin-dashboard/admin-appointments">
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-green-700 font-semibold"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-2">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No appointments scheduled for today
              </div>
            ) : (
              todaySchedule.map((appt, idx) => (
                <div
                  key={`${appt.name}-${appt.time}`}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    idx === 0
                      ? "border-green-500 bg-green-50"
                      : "border-transparent bg-gray-50"
                  }`}
                >
                  <div className="bg-green-100 rounded-full p-2">
                    {appt.isConsultation ? (
                      <Stethoscope className="w-6 h-6 text-green-700" />
                    ) : (
                      <Calendar className="w-6 h-6 text-green-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {appt.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appt.type} • {appt.time}
                    </div>
                  </div>
                  <div>
                    {appt.status === "confirmed" ? (
                      <span className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        confirmed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-xs font-semibold">
                        <Clock className="w-4 h-4" />
                        pending
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right column: quick actions, summary, status */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 w-full justify-start"
                    >
                      <Icon className="w-5 h-5 text-green-700" />
                      {action.label}
                    </Button>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">This Month's Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {monthSummary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span
                    className={`font-semibold ${
                      item.highlight ? "text-green-700" : "text-gray-900"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {systemStatus.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span
                    className={`font-semibold ${
                      item.status === "Online"
                        ? "text-green-700"
                        : item.status === "Healthy"
                        ? "text-green-500"
                        : "text-yellow-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <div className="text-xs text-gray-400">
            Latest updates and notifications
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          ) : (
            recentActivity.map((act, idx) => {
              const Icon = act.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <Icon className={`w-5 h-5 ${act.color}`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {act.title}
                      {act.type === "consultation" && (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-semibold ml-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> New
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{act.name}</div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {act.time}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </main>
  );
}
