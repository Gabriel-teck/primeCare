"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DoctorSettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [specialty, setSpecialty] = useState("General Practice");
  const [meetLink, setMeetLink] = useState("https://meet.google.com/ada-care");
  const [meetNotes, setMeetNotes] = useState(
    "Join a few minutes early. Have your ID ready.",
  );
  const [hoursStart, setHoursStart] = useState("09:00");
  const [hoursEnd, setHoursEnd] = useState("17:00");
  const [availableDays, setAvailableDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [notifyBooking, setNotifyBooking] = useState(true);
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [notifyAdmin, setNotifyAdmin] = useState(true);

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Profile, availability, and notification preferences."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminSectionCard title="Profile">
          <dl className="mb-4 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-[#212529]">
                {user?.fullName || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="text-[#212529]">{user?.email || "—"}</dd>
            </div>
          </dl>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Specialty
              </label>
              <Input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
            <Button
              className="bg-green-700 hover:bg-green-600"
              onClick={() => toast.message("Settings API not connected yet")}
            >
              Save profile
            </Button>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Video consult defaults">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Default Meet link
              </label>
              <Input
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Patient instructions
              </label>
              <textarea
                value={meetNotes}
                onChange={(e) => setMeetNotes(e.target.value)}
                className="min-h-24 w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700"
              />
            </div>
            <Button
              className="bg-green-700 hover:bg-green-600"
              onClick={() => toast.message("Settings API not connected yet")}
            >
              Save defaults
            </Button>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Availability">
          <div className="mb-3 flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const on = availableDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    on
                      ? "bg-green-700 text-white"
                      : "border border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">From</label>
              <Input
                type="time"
                value={hoursStart}
                onChange={(e) => setHoursStart(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">To</label>
              <Input
                type="time"
                value={hoursEnd}
                onChange={(e) => setHoursEnd(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="mt-3 bg-green-700 hover:bg-green-600"
            onClick={() => toast.message("Settings API not connected yet")}
          >
            Save availability
          </Button>
        </AdminSectionCard>

        <AdminSectionCard title="Notifications">
          <div className="space-y-3 text-sm">
            <ToggleRow
              label="New booking requests"
              checked={notifyBooking}
              onChange={setNotifyBooking}
            />
            <ToggleRow
              label="New patient messages"
              checked={notifyPatient}
              onChange={setNotifyPatient}
            />
            <ToggleRow
              label="Admin messages"
              checked={notifyAdmin}
              onChange={setNotifyAdmin}
            />
            <Button
              className="bg-green-700 hover:bg-green-600"
              onClick={() => toast.message("Settings API not connected yet")}
            >
              Save notifications
            </Button>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Account" className="lg:col-span-2">
          <p className="mb-3 text-sm text-gray-600">
            Sign out of the doctor workspace on this device.
          </p>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
        </AdminSectionCard>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5">
      <span className="text-[#212529]">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-green-700"
      />
    </label>
  );
}
