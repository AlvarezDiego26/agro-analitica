import { apiClient } from "../../lib/api-client";
import type { AuthMeResult, AuthResult } from "./types";

export async function registerAuth(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<AuthResult> {
  return apiClient<AuthResult>({
    path: "/api/auth/register",
    method: "POST",
    body: input
  });
}

export async function loginAuth(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  return apiClient<AuthResult>({
    path: "/api/auth/login",
    method: "POST",
    body: input
  });
}

export async function getCurrentAuthUser(token: string): Promise<AuthMeResult> {
  return apiClient<AuthMeResult>({
    path: "/api/auth/me",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function logoutAuth(token: string): Promise<{ success: true }> {
  return apiClient<{ success: true }>({
    path: "/api/auth/logout",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
