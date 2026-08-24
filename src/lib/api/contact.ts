import { api } from "./client";

export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

export async function submitContact(data: ContactPayload) {
  return api.post<{ ok: boolean }>("/contact", data);
}
