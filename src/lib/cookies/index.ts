import { ACCESS_TOKEN_KEY } from "@/lib/api";

function isLocalhost(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function cookieDomain(): string | undefined {
  if (isLocalhost()) {
    return undefined;
  }
  const configured = import.meta.env.VITE_COOKIE_DOMAIN?.trim();
  if (!configured) {
    return undefined;
  }
  const host = window.location.hostname;
  const domain = configured.replace(/^\./, "");
  if (host === domain || host.endsWith(`.${domain}`)) {
    return configured.startsWith(".") ? configured : `.${configured}`;
  }
  return undefined;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const prefix = `${name}=`;
  const row = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  if (!row) {
    return undefined;
  }
  return row.slice(prefix.length);
}

export const setCookie = (name: string, value: string) => {
  const domain = cookieDomain();
  const parts = [
    `${name}=${value}`,
    "path=/",
    domain ? `domain=${domain}` : "",
    isLocalhost() ? "SameSite=Lax" : "Secure; SameSite=Lax",
  ].filter(Boolean);
  document.cookie = parts.join("; ");
};

export const getCookie = (name: string) => {
  return readCookie(name);
};

export const removeCookie = (name: string) => {
  const domain = cookieDomain();
  const parts = [
    `${name}=`,
    "expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "path=/",
    domain ? `domain=${domain}` : "",
  ].filter(Boolean);
  document.cookie = parts.join(";");
  if (domain) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};

export const setAccessToken = (token: string) => {
  setCookie(ACCESS_TOKEN_KEY, token);
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // ignore quota / private mode
  }
};

export const removeAccessToken = () => {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie("tg_news_bot_access_token");
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
};
