"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader, AdminSectionCard } from "@/components/admin";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  changePassword,
  getErrorMessage,
  getPlatformSettings,
  updatePlatformSettings,
} from "@/lib/api";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [brandName, setBrandName] = useState("PrimeCare");
  const [supportEmail, setSupportEmail] = useState("support@primecare.health");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadingSettings(false);
      return;
    }
    setLoadingSettings(true);
    getPlatformSettings(token)
      .then((settings) => {
        setBrandName(settings.brandName);
        setSupportEmail(settings.supportEmail);
        setTimezone(settings.timezone);
      })
      .catch((error) => {
        toast.error(getErrorMessage(error, "Could not load platform settings"));
      })
      .finally(() => setLoadingSettings(false));
  }, [token]);

  const handleSavePlatform = async () => {
    if (!brandName.trim() || !supportEmail.trim() || !timezone.trim()) {
      toast.error("Please fill in all platform fields");
      return;
    }
    setSavingSettings(true);
    try {
      const updated = await updatePlatformSettings(
        {
          brandName: brandName.trim(),
          supportEmail: supportEmail.trim(),
          timezone: timezone.trim(),
        },
        token,
      );
      setBrandName(updated.brandName);
      setSupportEmail(updated.supportEmail);
      setTimezone(updated.timezone);
      toast.success("Platform settings saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save platform settings"));
    } finally {
      setSavingSettings(false);
    }
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
                disabled={loadingSettings || savingSettings}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Support email
              </label>
              <Input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                disabled={loadingSettings || savingSettings}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Timezone
              </label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={loadingSettings || savingSettings}
              />
            </div>
            <Button
              className="bg-green-700 hover:bg-green-600"
              disabled={loadingSettings || savingSettings}
              onClick={() => void handleSavePlatform()}
            >
              {savingSettings ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save platform settings"
              )}
            </Button>
          </div>
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

        <AdminSectionCard title="Account" className="lg:col-span-2">
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
          <Button
            variant="outline"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Log out
          </Button>
        </AdminSectionCard>
      </div>
    </div>
  );
}
