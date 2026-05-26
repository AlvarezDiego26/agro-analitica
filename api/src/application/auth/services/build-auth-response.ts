import type { AuthResponse, AuthSession, AuthUser } from "../../../domain/auth/entities/auth.entity.js";

export function buildAuthResponse(user: AuthUser, session: AuthSession, isNewUser: boolean): AuthResponse {
  return {
    token: session.token,
    expiresAt: session.expiresAt,
    isNewUser,
    user
  };
}
