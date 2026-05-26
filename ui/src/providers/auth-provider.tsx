"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getCurrentAuthUser, loginAuth, logoutAuth, registerAuth } from "../features/auth/auth-api";
import { clearSession, readSession, writeSession } from "../features/auth/auth-storage";
import type { AuthUser } from "../features/auth/types";

type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  currentUser: AuthUser | null;
  refreshAuth: () => Promise<void>;
  login: (input: LoginInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  register: (input: RegisterInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => void;
  requireAuth: (message?: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const refreshAuth = useCallback(async () => {
    const session = readSession();

    if (!session?.token) {
      setCurrentUser(null);
      setIsNewUser(false);
      setIsReady(true);
      return;
    }

    try {
      const result = await getCurrentAuthUser(session.token);
      setCurrentUser(result.user);
      setIsNewUser(result.isNewUser);
    } catch {
      clearSession();
      setCurrentUser(null);
      setIsNewUser(false);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootAuth() {
      const session = readSession();

      if (!session?.token) {
        if (isMounted) {
          setCurrentUser(null);
          setIsNewUser(false);
          setIsReady(true);
        }
        return;
      }

      try {
        const result = await getCurrentAuthUser(session.token);

        if (!isMounted) return;
        setCurrentUser(result.user);
        setIsNewUser(result.isNewUser);
      } catch {
        clearSession();
        if (!isMounted) return;
        setCurrentUser(null);
        setIsNewUser(false);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    void bootAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    try {
      const result = await loginAuth({
        email: input.email.trim().toLowerCase(),
        password: input.password
      });

      writeSession({
        token: result.token,
        expiresAt: result.expiresAt
      });
      setCurrentUser(result.user);
      setIsNewUser(result.isNewUser);
      return { ok: true as const };
    } catch (error) {
      return {
        ok: false as const,
        message: error instanceof Error ? error.message : "No se pudo iniciar sesion."
      };
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const result = await registerAuth({
        email: input.email.trim().toLowerCase(),
        password: input.password,
        fullName: input.fullName.trim()
      });

      writeSession({
        token: result.token,
        expiresAt: result.expiresAt
      });
      setCurrentUser(result.user);
      setIsNewUser(result.isNewUser);
      return { ok: true as const };
    } catch (error) {
      return {
        ok: false as const,
        message: error instanceof Error ? error.message : "No se pudo crear la cuenta."
      };
    }
  }, []);

  const logout = useCallback(() => {
    const session = readSession();
    if (session?.token) {
      void logoutAuth(session.token).catch(() => undefined);
    }

    clearSession();
    setCurrentUser(null);
    setIsNewUser(false);
    router.push("/");
    router.refresh();
  }, [router]);

  const requireAuth = useCallback(
    (message = "Necesitas registrarte para continuar con esta accion.") => {
      if (currentUser) return true;
      router.push(`/login?reason=${encodeURIComponent(message)}`);
      return false;
    },
    [currentUser, router]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: currentUser !== null,
      isNewUser: currentUser !== null && isNewUser,
      currentUser,
      refreshAuth,
      login,
      register,
      logout,
      requireAuth
    }),
    [currentUser, isNewUser, isReady, login, logout, refreshAuth, register, requireAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
