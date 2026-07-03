export const setCookie = (name: string, value: string) => {
  const domain = import.meta.env.DEV
    ? "localhost"
    : import.meta.env.VITE_COOKIE_DOMAIN || ".worldautogroup.ru";

  document.cookie = `${name}=${value}; path=/; domain=${domain}; ${
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
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};
