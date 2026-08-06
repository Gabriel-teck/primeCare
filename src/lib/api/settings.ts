import { api } from "./client";

export type PlatformSettings = {
  id: string;
  brandName: string;
  supportEmail: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdatePlatformSettingsPayload = {
  brandName: string;
  supportEmail: string;
  timezone: string;
};

export async function getPlatformSettings(token?: string | null) {
  return api.get<PlatformSettings>("/settings/platform", {
    token,
    auth: true,
  });
}

export async function updatePlatformSettings(
  payload: UpdatePlatformSettingsPayload,
  token?: string | null,
) {
  return api.patch<PlatformSettings>("/settings/platform", payload, {
    token,
    auth: true,
  });
}
