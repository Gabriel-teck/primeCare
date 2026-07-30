"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyConsultations } from "@/lib/api/consultation";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { getChatAccess, getMyPayments } from "@/lib/api/payments";
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
  const { user, logout, token } = useAuth();
  const initialTab = (searchParams.get("tab") as CareTab) || "profile";
  const [tab, setTab] = useState<CareTab>(
    ["profile", "records", "billing"].includes(initialTab)
      ? initialTab
      : "profile",
  );
  const [phone, setPhone] = useState("");
  const [records, setRecords] = useState<ConsultRecord[]>([]);
  const [localFiles, setLocalFiles] = useState<
    { id: string; name: string; addedAt: string }[]
  >([]);
  const [chatAccess, setChatAccess] = useState(false);
  const [billing, setBilling] = useState<Payment[]>([]);

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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const addLocalFile = (file?: File | null) => {
    if (!file) return;
    const next = [
      {
        id: `local-${Date.now()}`,
        name: file.name,
        addedAt: new Date().toISOString().slice(0, 10),
      },
      ...localFiles,
    ];
    setLocalFiles(next);
    try {
      localStorage.setItem("primecare-local-records", JSON.stringify(next));
    } catch {
      // ignore
    }
    toast.success("File saved to My Care records (device only)");
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
                <dd className="font-medium text-[#212529]">
                  {user?.fullName || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-[#212529]">{user?.email || "—"}</dd>
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
              />
            </div>
            <Button
              className="mt-3 bg-green-700 hover:bg-green-600"
              onClick={() => toast.success("Profile saved (local)")}
            >
              Save profile
            </Button>
          </AdminSectionCard>

          <AdminSectionCard title="Account">
            <p className="mb-3 text-sm text-gray-600">
              Chat access on this device:{" "}
              <span className="font-medium text-[#212529]">
                {chatAccess ? "Unlocked" : "Not unlocked"}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a href="/patient-dashboard/messages">Open Messages</a>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </AdminSectionCard>
        </div>
      ) : null}

      {tab === "records" ? (
        <div className="space-y-4">
          <AdminSectionCard
            title="Upload a file"
            description="Stored on this device for now. Files attached to online consultations also appear below."
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green-700 hover:file:bg-green-100"
              onChange={(e) => addLocalFile(e.target.files?.[0])}
            />
          </AdminSectionCard>

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
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Open
                        </a>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminSectionCard>

          <AdminSectionCard title="Your uploads">
            {localFiles.length === 0 ? (
              <p className="text-sm text-gray-500">No local uploads yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {localFiles.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <span className="font-medium text-[#212529]">{f.name}</span>
                    <span className="text-gray-500">{f.addedAt}</span>
                  </li>
                ))}
              </ul>
            )}
          </AdminSectionCard>
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
