import { getCookie } from "../cookies";

export async function getData(url: string, options: RequestInit = {}) {
  if (typeof window === "undefined") {
    console.warn("getData should be used in a browser environment only");
  }

  const response = await fetch(url, {
    ...options,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

export async function secureGetData(url: string, options: RequestInit = {}) {
  if (typeof window === "undefined") {
    console.warn("secureGetData should be used in a browser environment only");
  }

  const token = typeof window !== "undefined" ? getCookie("tg_news_bot_access_token") : null;

  if (!token) {
    throw new Error("No access token");
  }

  const response = await fetch(url, {
    ...options,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "x-user-id": token }),
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

export async function securePostData(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  options: RequestInit = {}
) {
  if (typeof window === "undefined") {
    console.warn("securePostData should be used in a browser environment only");
  }

  const token = typeof window !== "undefined" ? getCookie("tg_news_bot_access_token") : null;

  if (!token) {
    throw new Error("No access token");
  }

  const response = await fetch(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...(token && { "x-user-id": token }),
      ...options.headers,
    },
    credentials: "include",
  });

  return response.json();
}

export async function securePatchData(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  options: RequestInit = {}
) {
  if (typeof window === "undefined") {
    console.warn(
      "securePatchData should be used in a browser environment only"
    );
  }

  const token = typeof window !== "undefined" ? getCookie("tg_news_bot_access_token") : null;

  if (!token) {
    throw new Error("No access token");
  }

  const response = await fetch(url, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...(token && { "x-user-id": token }),
      ...options.headers,
    },
    credentials: "include",
  });

  return response.json();
}

export async function secureDeleteData(url: string, options: RequestInit = {}) {
  if (typeof window === "undefined") {
    console.warn(
      "secureDeleteData should be used in a browser environment only"
    );
  }

  const token = typeof window !== "undefined" ? getCookie("tg_news_bot_access_token") : null;

  if (!token) {
    throw new Error("No access token");
  }

  const response = await fetch(url, {
    ...options,
    method: "DELETE",
    headers: {
      ...(token && { "x-user-id": token }),
      ...options.headers,
    },
    credentials: "include",
  });

  return response.json();
}
