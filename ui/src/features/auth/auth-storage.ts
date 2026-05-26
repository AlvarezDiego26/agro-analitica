import type { AuthSession } from "./types";

const SESSION_STORAGE_KEY = "agro.auth.session";
const SESSION_COOKIE_KEY = "agro_auth_session";

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const localSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (localSession) {
    try {
      return JSON.parse(localSession) as AuthSession;
    } catch {
      return null;
    }
  }

  const cookieValue = readCookie(SESSION_COOKIE_KEY);
  if (!cookieValue) return null;

  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as AuthSession;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(session);
  window.localStorage.setItem(SESSION_STORAGE_KEY, serialized);
  document.cookie = `${SESSION_COOKIE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=${getMaxAgeSeconds(session.expiresAt)}; samesite=lax`;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
  return match ? match.split("=").slice(1).join("=") : null;
}

function getMaxAgeSeconds(expiresAt: string): number {
  const expiresAtMs = new Date(expiresAt).getTime();
  return Math.max(Math.floor((expiresAtMs - Date.now()) / 1000), 0);
}
