import { API_BASE_URL } from "./config";

/** Resolve API-relative upload paths to absolute URLs for <img> / next/image. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (
    /^https?:\/\//i.test(url) ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/uploads")) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}
