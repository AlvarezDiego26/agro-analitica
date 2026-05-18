export type ApiClientRequest = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

export async function apiClient<T>({ path, method = "GET" }: ApiClientRequest): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${method} ${path}`);
  }

  return (await response.json()) as T;
}
