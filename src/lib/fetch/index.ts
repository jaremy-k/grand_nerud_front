import { getAccessToken } from "@/lib/api";
import { removeAccessToken } from "@/lib/cookies";

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Требуется авторизация");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    removeAccessToken();
    unauthorizedHandler?.();
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Требуется авторизация");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || `HTTP error! status: ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function getData<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function postData<T = unknown>(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    method: "POST",
    body: data !== undefined ? JSON.stringify(data) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function secureGetData<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function securePostData<T = unknown>(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function securePatchData<T = unknown>(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function secureDeleteData<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    method: "DELETE",
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });

  return parseResponse<T>(response);
}
