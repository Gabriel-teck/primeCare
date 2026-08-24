import { api } from "./client";
import type {
  CatalogItem,
  CreateCatalogPayload,
  UpdateCatalogPayload,
} from "@/types";

function appendCatalogFields(
  formData: FormData,
  data: CreateCatalogPayload | UpdateCatalogPayload,
) {
  Object.entries(data).forEach(([key, value]) => {
    if (key === "image" || value === undefined) return;
    if (value === null) {
      formData.append(key, "");
      return;
    }
    formData.append(key, String(value));
  });
}

export async function listCatalog() {
  return api.get<CatalogItem[]>("/catalog");
}

export async function getCatalogItem(id: string) {
  return api.get<CatalogItem>(`/catalog/${id}`);
}

export async function createCatalogItem(
  data: CreateCatalogPayload,
  token: string | null,
) {
  if (data.image) {
    const formData = new FormData();
    appendCatalogFields(formData, data);
    formData.append("image", data.image);
    return api.postForm<CatalogItem>("/catalog", formData, {
      token,
      auth: true,
    });
  }

  const { image: _image, ...json } = data;
  return api.post<CatalogItem>("/catalog", json, { token, auth: true });
}

export async function updateCatalogItem(
  id: string,
  data: UpdateCatalogPayload,
  token: string | null,
) {
  if (data.image) {
    const formData = new FormData();
    appendCatalogFields(formData, data);
    formData.append("image", data.image);
    return api.patchForm<CatalogItem>(`/catalog/${id}`, formData, {
      token,
      auth: true,
    });
  }

  const { image: _image, ...json } = data;
  return api.patch<CatalogItem>(`/catalog/${id}`, json, { token, auth: true });
}

export async function deleteCatalogItem(id: string, token: string | null) {
  return api.delete<{ ok: boolean }>(`/catalog/${id}`, { token, auth: true });
}
