import { api } from "./client";
import type {
  CatalogItem,
  CreateCatalogPayload,
  UpdateCatalogPayload,
} from "@/types";

export async function listCatalog() {
  return api.get<CatalogItem[]>("/catalog");
}

export async function createCatalogItem(
  data: CreateCatalogPayload,
  token: string | null,
) {
  return api.post<CatalogItem>("/catalog", data, { token, auth: true });
}

export async function updateCatalogItem(
  id: string,
  data: UpdateCatalogPayload,
  token: string | null,
) {
  return api.patch<CatalogItem>(`/catalog/${id}`, data, { token, auth: true });
}
