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
  return import.meta.env.VITE_COOKIE_DOMAIN || ".worldautogroup.ru";
}

function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

export const setCookie = (name: string, value: string) => {
  const domain = cookieDomain();
  const parts = [
    `${name}=${value}`,
    "path=/",
    domain ? `domain=${domain}` : "",
    isSecureContext() ? "Secure; SameSite=None" : "SameSite=Lax",
  ].filter(Boolean);
  document.cookie = parts.join("; ");
};

export const getCookie = (name: string) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
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
};

export const setAccessToken = (token: string) => {
  setCookie(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = () => {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie("tg_news_bot_access_token");
};
