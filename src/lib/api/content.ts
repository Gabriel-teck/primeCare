import { api } from "./client";
import type {
  ContentBlock,
  UpdateContentPayload,
  UpsertContentPayload,
} from "@/types";

export async function listContent() {
  return api.get<ContentBlock[]>("/content");
}

export async function upsertContent(
  data: UpsertContentPayload,
  token: string | null,
) {
  return api.post<ContentBlock>("/content", data, { token, auth: true });
}

export async function updateContent(
  key: string,
  data: UpdateContentPayload,
  token: string | null,
) {
  return api.patch<ContentBlock>(`/content/${key}`, data, {
    token,
    auth: true,
  });
}
