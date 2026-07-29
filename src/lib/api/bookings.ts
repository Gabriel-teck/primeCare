import { api } from "./client";
import type { AdminBooking } from "@/lib/admin/types";

export type ListBookingsParams = {
  status?: string;
  type?: string;
  search?: string;
};

export async function listBookings(
  token: string | null,
  params: ListBookingsParams = {},
) {
  const { status, type, search } = params;
  return api.get<AdminBooking[]>("/bookings", {
    token,
    auth: true,
    query: {
      status: status && status !== "all" ? status : undefined,
      type: type && type !== "all" ? type : undefined,
      search: search?.trim() || undefined,
    },
  });
}
