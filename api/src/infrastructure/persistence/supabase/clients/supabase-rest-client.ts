import { loadEnv } from "../../../config/env.js";
import { HttpError } from "../../../../interfaces/http/middlewares/http-error.js";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  preferSingle?: boolean;
};

export class SupabaseRestClient {
  private readonly baseUrl: string;
  private readonly serviceRoleKey: string;

  constructor() {
    const env = loadEnv();

    if (!env.supabase.url || !env.supabase.serviceRoleKey) {
      throw new HttpError(500, "Supabase environment variables are missing");
    }

    this.baseUrl = `${env.supabase.url}/rest/v1`;
    this.serviceRoleKey = env.supabase.serviceRoleKey;
  }

  async request<T>(tableOrPath: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}/${tableOrPath}`);

    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: options.preferSingle ? "return=representation" : "return=representation"
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new HttpError(502, "Supabase request failed", detail);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
