import { ACCESS_TOKEN_KEY } from "@/lib/api";

function cookieDomain(): string {
  return import.meta.env.DEV
    ? "localhost"
    : import.meta.env.VITE_COOKIE_DOMAIN || ".worldautogroup.ru";
}

export const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; domain=${cookieDomain()}; ${
    import.meta.env.PROD ? "Secure; SameSite=None" : "SameSite=Lax"
  }`;
};

export const getCookie = (name: string) => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
};

export const removeCookie = (name: string) => {
  const domain = cookieDomain();
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
};

export const setAccessToken = (token: string) => {
  setCookie(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = () => {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie("tg_news_bot_access_token");
};
