"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { changePassword, getErrorMessage, getUser } from "@/lib/api";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DoctorSettingsPage() {
  const { user, token } = useAuth();
  const [specialty, setSpecialty] = useState<string | null>(null);
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
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setSpecialty(null);
      return;
    }
    getUser(token)
      .then((profile) => {
        const value = profile.doctorProfile?.specialty?.trim();
        setSpecialty(value || null);
      })
      .catch(() => setSpecialty(null));
  }, [token]);

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    setUpdatingPassword(true);
    try {
      await changePassword(oldPassword, newPassword, token);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update password"));
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Profile, availability, and notification preferences."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminSectionCard title="Profile">
          <dl className="space-y-2 text-sm">
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
            <div>
              <dt className="text-gray-500">Specialty</dt>
              <dd className="text-[#212529]">{specialty || "N/A"}</dd>
            </div>
          </dl>
        </AdminSectionCard>

        <AdminSectionCard title="Security Management">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-gray-600">
                Old Password
              </label>
              <PasswordInput
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={updatingPassword}
                className="rounded-md border border-gray-200 py-2.5 focus:border-green-700 focus:ring-1 focus:ring-green-700"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-600">
                New Password
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
                disabled={updatingPassword}
                className="rounded-md border border-gray-200 py-2.5 focus:border-green-700 focus:ring-1 focus:ring-green-700"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-gray-600">
                Confirm New Password
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
                disabled={updatingPassword}
                className="rounded-md border border-gray-200 py-2.5 focus:border-green-700 focus:ring-1 focus:ring-green-700"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={() => void handleUpdatePassword()}
                disabled={updatingPassword}
                className="h-11 w-full rounded-full bg-green-700 text-white hover:bg-green-600"
              >
                {updatingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Update Password
              </Button>
            </div>
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
