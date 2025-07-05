"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageSquare,
  Users,
  Clock,
  Stethoscope,
  CheckCircle,
  AlertTriangle,
  User,
  Settings,
  BarChart2,
  FileText,
  Database,
  ArrowRight,
} from "lucide-react";
import React, { useState } from "react";



const summaryData = [
  {
    title: "Today's Appointments",
    value: 12,
    icon: <Calendar className="w-5 h-5 text-green-700" />,
    sub: "+15% from yesterday",
    highlight: true,
  },
  {
    title: "Pending Requests",
    value: 23,
    icon: <Clock className="w-5 h-5 text-yellow-500" />,
    sub: "Require your attention",
  },
  {
    title: "Unread Messages",
    value: 8,
    icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
    sub: "Total: 42 messages",
  },
  {
    title: "Response Time",
    value: "2.3 hours",
    icon: <Clock className="w-5 h-5 text-green-700" />,
    sub: "25% faster this week",
    highlight: true,
  },
];

const schedule = [
  {
    name: "John Doe",
    type: "Consultation",
    time: "9:00 AM",
    status: "confirmed",
  },
  {
    name: "Sarah Wilson",
    type: "Follow-up",
    time: "10:30 AM",
    status: "confirmed",
  },
  {
    name: "Mike Johnson",
    type: "Check-up",
    time: "2:00 PM",
    status: "pending",
  },
];

const activity = [
  {
    type: "appointment",
    title: "New appointment request",
    name: "John Doe - Consultation",
    time: "5 minutes ago",
    icon: Calendar,
    color: "text-blue-600",
  },
  {
    type: "message",
    title: "New message received",
    name: "Sarah Wilson - Medication question",
    time: "12 minutes ago",
    icon: MessageSquare,
    urgent: true,
    color: "text-green-600",
  },
  {
    type: "appointment",
    title: "Appointment confirmed",
    name: "Mike Johnson - Follow-up",
    time: "1 hour ago",
    icon: Calendar,
    color: "text-blue-600",
  },
  {
    type: "response",
    title: "Patient response",
    name: "Emily Davis - Rescheduling request",
    time: "2 hours ago",
    icon: MessageSquare,
    color: "text-green-600",
  },
];

const quickActions = [
  { label: "View Appointments", icon: Calendar },
  { label: "Check Messages", icon: MessageSquare },
  { label: "Patient Records", icon: FileText },
  { label: "View Reports", icon: BarChart2 },
];

const monthSummary = [
  { label: "Total Patients", value: 89 },
  { label: "Appointments", value: 156 },
  { label: "Growth Rate", value: "+12.5%", highlight: true },
  { label: "Avg. Response", value: "2.3 hours" },
];

const systemStatus = [
  { label: "Appointment System", status: "Online" },
  { label: "Messaging Service", status: "Online" },
  { label: "Database", status: "Healthy" },
];

export default function AdminDashboard() {
  return (
     
       
        <main className="p-4 md:p-8 flex flex-col gap-6">
          {/* Dashboard header and summary cards */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  Welcome back, Dr. Smith. Here's what's happening today.
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
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-green-700 font-semibold"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-2">
                {schedule.map((appt, idx) => (
                  <div
                    key={appt.name}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      idx === 1
                        ? "border-green-500 bg-green-50"
                        : "border-transparent bg-gray-50"
                    }`}
                  >
                    <div className="bg-green-100 rounded-full p-2">
                      <Calendar className="w-6 h-6 text-green-700" />
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
                ))}
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
                      <Button
                        key={action.label}
                        variant="outline"
                        className="flex items-center gap-2 w-full justify-start"
                      >
                        <Icon className="w-5 h-5 text-green-700" />
                        {action.label}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    This Month's Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {monthSummary.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {item.label}
                      </span>
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
                      <span className="text-sm text-gray-600">
                        {item.label}
                      </span>
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
              {activity.map((act, idx) => {
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
                        {act.urgent && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold ml-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Urgent
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
              })}
            </CardContent>
          </Card>
        </main>
  );
}
