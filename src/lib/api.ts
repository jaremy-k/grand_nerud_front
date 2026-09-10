function normalizeApiUrl(raw: string): string {
  const url = raw.trim().replace(/\/$/, "");
  if (!url) {
    return "";
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  return `https://${url}`;
}

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL ?? "");

export const ACCESS_TOKEN_KEY = "grand_nerud_access_token";

const LEGACY_TOKEN_KEY = "tg_news_bot_access_token";

export function apiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!API_URL) {
    console.warn("VITE_API_URL is not set");
  }
  return `${API_URL}${normalized}`;
}

export function getAccessToken(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${ACCESS_TOKEN_KEY}=`))
      ?.split("=")[1] ??
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${LEGACY_TOKEN_KEY}=`))
      ?.split("=")[1]
  );
}
