export type ApiClientRequest = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function apiClient<T>({ path, method = "GET", body, headers }: ApiClientRequest): Promise<T> {
  const isServer = typeof window === "undefined";
  const baseUrl =
    (isServer ? process.env.INTERNAL_API_BASE_URL : process.env.NEXT_PUBLIC_API_BASE_URL) ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:3001";
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    cache: "no-store",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let message = `API request failed for ${method} ${path}`;

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // ignore parse errors
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
