import { API_BASE_URL } from "../config/env";

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = API_BASE_URL;
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    credentials: "include", // important for CSRF cookies
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Request failed (${res.status}): ${errorText}`);
  }

  return res.json();
}
