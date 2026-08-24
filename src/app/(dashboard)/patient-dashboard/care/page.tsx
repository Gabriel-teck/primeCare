"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyConsultations } from "@/lib/api/consultation";
import { changePassword, getErrorMessage, updateProfile } from "@/lib/api";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusBadge,
} from "@/components/admin";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Download, FileText, Loader2, Pencil } from "lucide-react";
import { getChatAccess, getMyPayments } from "@/lib/api/payments";
import { resolveMediaUrl } from "@/lib/api/media";
import type { Payment } from "@/types";

type CareTab = "profile" | "records" | "billing";

type ConsultRecord = {
  id: string;
  date: string;
  time: string;
  status: string;
  reason?: string;
  fileUrl?: string;
  fileName?: string;
};

function isImageFile(fileName?: string | null, fileUrl?: string | null) {
  const name = (fileName || fileUrl || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
}

function isPdfFile(fileName?: string | null, fileUrl?: string | null) {
  const name = (fileName || fileUrl || "").toLowerCase();
  return /\.pdf($|\?)/i.test(name);
}
export default function MyCarePage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
      <MyCareContent />
    </Suspense>
  );
}

function MyCareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, token, setUser } = useAuth();
  const initialTab = (searchParams.get("tab") as CareTab) || "profile";
  const [tab, setTab] = useState<CareTab>(
    ["profile", "records", "billing"].includes(initialTab)
      ? initialTab
      : "profile",
  );
  const [fullName, setFullName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [records, setRecords] = useState<ConsultRecord[]>([]);
  const [localFiles, setLocalFiles] = useState<
    { id: string; name: string; addedAt: string }[]
  >([]);
  const [chatAccess, setChatAccess] = useState(false);
  const [billing, setBilling] = useState<Payment[]>([]);
  const [previewFile, setPreviewFile] = useState<ConsultRecord | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setPhone(user.phone || "");
  }, [user]);

  const previewUrl = previewFile?.fileUrl
    ? resolveMediaUrl(previewFile.fileUrl)
    : "";
  const previewLabel = previewFile?.fileName || "Attachment";
  const previewIsImage = isImageFile(
    previewFile?.fileName,
    previewFile?.fileUrl,
  );
  const previewIsPdf = isPdfFile(previewFile?.fileName, previewFile?.fileUrl);

  useEffect(() => {
    const next = searchParams.get("tab") as CareTab | null;
    if (next && ["profile", "records", "billing"].includes(next)) {
      setTab(next);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!token) return;
    getChatAccess(token)
      .then((res) => setChatAccess(Boolean(res?.entitled)))
      .catch(() => setChatAccess(false));
    try {
      const raw = localStorage.getItem("primecare-local-records");
      if (raw) setLocalFiles(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!token || tab !== "records") return;
    getMyConsultations(token)
      .then((rows: ConsultRecord[]) => setRecords(rows || []))
      .catch(() => setRecords([]));
  }, [token, tab]);

  useEffect(() => {
    if (!token || tab !== "billing") return;
    getMyPayments(token)
      .then((rows) => setBilling(rows || []))
      .catch(() => setBilling([]));
  }, [token, tab]);

  const consultFiles = useMemo(
    () => records.filter((r) => r.fileUrl),
    [records],
  );

  const setCareTab = (next: CareTab) => {
    setTab(next);
    router.replace(`/patient-dashboard/care?tab=${next}`);
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

  const handleSaveProfile = async () => {
    const nextName = fullName.trim();
    if (!nextName) {
      toast.error("Full name is required");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await updateProfile(
        { fullName: nextName, phone: phone.trim() },
        token,
      );
      setUser(updated);
      setFullName(updated.fullName);
      setPhone(updated.phone || "");
      setEditingName(false);
      toast.success("Profile saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="My Care"
        description="Profile, medical records, and billing in one place."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["profile", "Profile"],
            ["records", "Records"],
            ["billing", "Billing"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setCareTab(id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              tab === id
                ? "bg-green-700 text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminSectionCard title="Your profile">
            <dl className="mb-4 space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Full name</dt>
                <dd className="mt-1">
                  {editingName ? (
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      disabled={savingProfile}
                      autoFocus
                      className="border-gray-200 focus-visible:border-green-700 focus-visible:ring-green-700"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#212529]">
                        {fullName || user?.fullName || "—"}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-600 hover:bg-green-50 hover:text-green-700"
                        aria-label="Edit full name"
                        disabled={savingProfile}
                        onClick={() => setEditingName(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="mt-1 text-[#212529]">{user?.email || "—"}</dd>
              </div>
            </dl>
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Phone (optional)
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Add a phone number"
                disabled={savingProfile}
              />
            </div>
            <Button
              className="mt-3 bg-green-700 hover:bg-green-600"
              disabled={savingProfile}
              onClick={() => void handleSaveProfile()}
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save profile"
              )}
            </Button>
            <p className="mt-4 text-sm text-gray-600">
              Chat access:{" "}
              <span className="font-medium text-[#212529]">
                {chatAccess ? "Unlocked" : "Not unlocked"}
              </span>
              {" · "}
              <a
                href="/patient-dashboard/messages"
                className="font-medium text-green-700 hover:underline"
              >
                Open Messages
              </a>
            </p>
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
                  onClick={handleUpdatePassword}
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
        </div>
      ) : null}

      {tab === "records" ? (
        <div className="space-y-4">
          <AdminSectionCard title="Consultation attachments">
            {consultFiles.length === 0 ? (
              <p className="text-sm text-gray-500">
                No files from online consultations yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {consultFiles.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[#212529]">
                        {r.fileName || "Attachment"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {r.date} · {r.time}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AdminStatusBadge status={r.status} />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewFile(r)}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Open
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminSectionCard>

          <Dialog
            open={Boolean(previewFile)}
            onOpenChange={(open) => {
              if (!open) setPreviewFile(null);
            }}
          >
            <DialogContent
              className={
                previewIsImage
                  ? "max-w-3xl border-none bg-transparent p-2 shadow-none sm:p-4"
                  : "max-w-3xl"
              }
            >
              <DialogHeader className={previewIsImage ? "sr-only" : undefined}>
                <DialogTitle>{previewLabel}</DialogTitle>
              </DialogHeader>

              {previewUrl && previewIsImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={previewLabel}
                  className="max-h-[85vh] w-full rounded-lg object-contain"
                />
              ) : null}

              {previewUrl && previewIsPdf ? (
                <iframe
                  src={previewUrl}
                  title={previewLabel}
                  className="h-[70vh] w-full rounded-md border border-gray-200"
                />
              ) : null}

              {previewUrl && !previewIsImage && !previewIsPdf ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <FileText className="h-12 w-12 text-green-700" />
                  <p className="text-sm text-gray-600">
                    Preview isn&apos;t available for this file type. Open it in
                    a new tab to view or download.
                  </p>
                  <Button asChild className="bg-green-700 hover:bg-green-600">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-1.5 h-4 w-4" />
                      Open file
                    </a>
                  </Button>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </div>
      ) : null}

      {tab === "billing" ? (
        <AdminSectionCard
          title="Billing history"
          description="Your payment history on PrimeCare."
        >
          {billing.length === 0 ? (
            <p className="text-sm text-gray-500">No payment records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-3 py-3 font-medium">Method</th>
                    <th className="px-3 py-3 font-medium">Date</th>
                    <th className="px-3 py-3 font-medium">Description</th>
                    <th className="px-3 py-3 font-medium">Fee</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-3 py-3">{row.method}</td>
                      <td className="px-3 py-3">
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-3 py-3">{row.description}</td>
                      <td className="px-3 py-3">
                        {row.currency} {Number(row.amount).toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <AdminStatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSectionCard>
      ) : null}
    </div>
  );
}
