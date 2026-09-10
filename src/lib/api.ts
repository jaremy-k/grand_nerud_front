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

function readCookieValue(name: string): string | undefined {
  const prefix = `${name}=`;
  const row = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  if (!row) {
    return undefined;
  }
  return row.slice(prefix.length);
}

export function getAccessToken(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      return stored;
    }
  } catch {
    // ignore
  }
  return readCookieValue(ACCESS_TOKEN_KEY) ?? readCookieValue(LEGACY_TOKEN_KEY);
}
