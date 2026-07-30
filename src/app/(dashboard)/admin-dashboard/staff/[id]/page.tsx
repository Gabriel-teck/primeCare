"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminSectionCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getStaffMember } from "@/lib/api/staff";
import type { StaffMember } from "@/types";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AdminStaffDetailPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;
    setLoading(true);
    getStaffMember(params.id, token)
      .then((data) =>
        setStaff({
          ...data,
          specialty: data.specialty || data.doctorProfile?.specialty,
          bio: data.bio || data.doctorProfile?.bio,
          active: data.active ?? data.isActive,
        }),
      )
      .catch(() => setStaff(null))
      .finally(() => setLoading(false));
  }, [token, params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1d884a]" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin-dashboard/staff" aria-label="Back to staff">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-sm text-gray-500">Staff member not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin-dashboard/staff" aria-label="Back to staff">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        {staff.role === "doctor" && staff.active !== false ? (
          <Button
            asChild
            className="rounded-2xl bg-green-700 hover:bg-green-600"
          >
            <Link href={`/admin-dashboard/chat?doctorId=${staff.id}`}>
              Message doctor
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminSectionCard title="Profile">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Full name</dt>
              <dd className="font-medium">{staff.fullName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium">{staff.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium capitalize">{String(staff.role)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Specialty</dt>
              <dd className="font-medium">{staff.specialty || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{staff.phone || "—"}</dd>
            </div>
          </dl>
        </AdminSectionCard>
        <AdminSectionCard title="Bio">
          <p className="text-sm text-gray-700">
            {staff.bio || "No bio provided yet."}
          </p>
        </AdminSectionCard>
      </div>
    </div>
  );
}
