const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message ?? "Request failed");
  }
  return response.json() as Promise<T>;
}
