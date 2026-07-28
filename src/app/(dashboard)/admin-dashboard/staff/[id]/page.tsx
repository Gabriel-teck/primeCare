"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { getStaffById } from "@/lib/admin/mock-staff";

export default function AdminStaffDetailPage() {
  const params = useParams<{ id: string }>();
  const staff = getStaffById(params.id);

  if (!staff) {
    return (
      <div>
        <AdminPageHeader title="Staff member not found" />
        <Button asChild variant="outline">
          <Link href="/admin-dashboard/staff">Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={staff.fullName}
        description={staff.email}
        actions={
          <>
            <AdminStatusBadge status={staff.active ? "active" : "inactive"} />
            {staff.role === "doctor" && staff.active ? (
              <Button asChild className="bg-green-700 hover:bg-green-600">
                <Link href={`/admin-dashboard/chat?doctorId=${staff.id}`}>
                  Message doctor
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminSectionCard title="Profile">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Role</dt>
              <dd className="font-medium capitalize">
                {staff.role.replace("_", " ")}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Specialty</dt>
              <dd className="font-medium">{staff.specialty}</dd>
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
