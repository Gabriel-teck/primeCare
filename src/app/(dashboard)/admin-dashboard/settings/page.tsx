"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [brandName, setBrandName] = useState("PrimeCare");
  const [supportEmail, setSupportEmail] = useState("support@primecare.health");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [meetNotes, setMeetNotes] = useState(
    "Share a Google Meet link when confirming video consultations.",
  );

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Platform and account preferences for the super-admin console."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminSectionCard title="Platform">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Brand name
              </label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Support email
              </label>
              <Input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Timezone
              </label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Meet link instructions
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
              Save platform settings
            </Button>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Account">
          <dl className="mb-4 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Signed in as</dt>
              <dd className="font-medium text-[#212529]">
                {user?.fullName || "Admin"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-[#212529]">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium capitalize text-[#212529]">
                {user?.role || "admin"}
              </dd>
            </div>
          </dl>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="border-green-700 text-green-700"
              onClick={() =>
                toast.message("Password change will use auth API later")
              }
            >
              Change password
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Log out
            </Button>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
