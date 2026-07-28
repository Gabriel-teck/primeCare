"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MessageSquare,
  Video,
  ExternalLink,
  Copy,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyAppointments } from "@/lib/api/appointment";
import { getMyConsultations } from "@/lib/api/consultation";
import {
  AdminPageHeader,
  AdminSectionCard,
  AdminStatCard,
  AdminStatusBadge,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Appointment = {
  id: string;
  date: string;
  time: string;
  status: string;
};

type Consultation = {
  id: string;
  date: string;
  time: string;
  status: string;
  consultationType: string;
  googleMeetLink?: string;
  reason?: string;
};

type NextCare =
  | ({ kind: "consultation" } & Consultation)
  | ({ kind: "appointment" } & Appointment);

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("primecare-message-unread");
      setUnread(raw ? Number(raw) || 0 : 0);
    } catch {
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appts, consults] = await Promise.all([
          getMyAppointments(token),
          getMyConsultations(token),
        ]);
        setAppointments(appts || []);
        setConsultations(consults || []);
      } catch {
        setAppointments([]);
        setConsultations([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [token]);

  const now = useMemo(() => new Date(), []);

  const isUpcoming = (item: { date: string; time: string; status: string }) =>
    item.status !== "cancelled" &&
    item.status !== "completed" &&
    new Date(`${item.date}T${item.time}`) >= now;

  const upcomingConsults = useMemo(
    () => consultations.filter(isUpcoming),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [consultations, now],
  );
  const upcomingAppts = useMemo(
    () => appointments.filter(isUpcoming),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, now],
  );

  const nextCare: NextCare | null = useMemo(() => {
    const combined: NextCare[] = [
      ...upcomingConsults.map((c) => ({ ...c, kind: "consultation" as const })),
      ...upcomingAppts.map((a) => ({ ...a, kind: "appointment" as const })),
    ].sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() -
        new Date(`${b.date}T${b.time}`).getTime(),
    );
    return combined[0] || null;
  }, [upcomingConsults, upcomingAppts]);

  const copyMeet = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Meet link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  if (!user) {
    return <p className="text-sm text-gray-500">Loading your care home…</p>;
  }

  return (
    <div>
      <AdminPageHeader
        title={`Welcome back, ${user.fullName}`}
        description="Your next care step, visits, and messages — in one place."
      />

      <AdminSectionCard
        title="Your next care"
        description={
          nextCare
            ? "This is the soonest visit that still needs your attention."
            : "Nothing upcoming — book care when you are ready."
        }
        className="mb-6"
      >
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : !nextCare ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-green-700 hover:bg-green-600">
              <Link href="/patient-dashboard/consultation">
                Book Online Consultation
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-green-700 text-green-700"
            >
              <Link href="/patient-dashboard/appointment">
                Book Appointment
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {nextCare.kind === "consultation"
                  ? "Online Consultation"
                  : "Appointment"}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#212529]">
                {nextCare.date} at {nextCare.time}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AdminStatusBadge status={nextCare.status} />
                {nextCare.kind === "consultation" && nextCare.reason ? (
                  <span className="truncate text-sm text-gray-500">
                    {nextCare.reason}
                  </span>
                ) : null}
              </div>
              {nextCare.status === "pending" ? (
                <p className="mt-2 text-sm text-amber-700">
                  Awaiting confirmation
                  {nextCare.kind === "consultation"
                    ? " — your Meet link will appear once confirmed."
                    : "."}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {nextCare.kind === "consultation" &&
              nextCare.googleMeetLink &&
              (nextCare.status === "confirmed" ||
                nextCare.status === "rescheduled") ? (
                <>
                  <Button asChild className="bg-green-700 hover:bg-green-600">
                    <a
                      href={nextCare.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Join video
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyMeet(nextCare.googleMeetLink!)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy link
                  </Button>
                </>
              ) : null}
              <Button asChild variant="outline">
                <Link
                  href={
                    nextCare.kind === "consultation"
                      ? "/patient-dashboard/consultation"
                      : "/patient-dashboard/appointment"
                  }
                >
                  View details
                </Link>
              </Button>
            </div>
          </div>
        )}
      </AdminSectionCard>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard
          label="Upcoming online consults"
          value={loading ? "…" : upcomingConsults.length}
          hint="Video visits"
          icon={Video}
        />
        <AdminStatCard
          label="Upcoming appointments"
          value={loading ? "…" : upcomingAppts.length}
          hint="Clinic / follow-up"
          icon={Calendar}
        />
        <AdminStatCard
          label="Unread messages"
          value={unread}
          hint="Care team inbox"
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild className="bg-green-700 hover:bg-green-600">
          <Link href="/patient-dashboard/consultation">
            Book Online Consultation
          </Link>
        </Button>
        <Button asChild className="bg-green-700 hover:bg-green-600">
          <Link href="/patient-dashboard/appointment">Book Appointment</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-green-700 text-green-700"
        >
          <Link href="/patient-dashboard/messages">Message care team</Link>
        </Button>
      </div>
    </div>
  );
}
