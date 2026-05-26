import type {
  AuthSession,
  AuthSessionRecord,
  AuthUser,
  AuthUserRecord,
  LoginAuthInput,
  RegisterAuthInput
} from "../entities/auth.entity.js";

export interface AuthRepository {
  findUserRecordByEmail(email: string): Promise<AuthUserRecord | null>;
  createUser(input: RegisterAuthInput, passwordHash: string): Promise<AuthUser>;
  createSession(userId: string, tokenHash: string, expiresAt: string): Promise<AuthSession>;
  updateLastLoginAt(userId: string, lastLoginAt: string): Promise<void>;
  findSessionByTokenHash(tokenHash: string): Promise<AuthSessionRecord | null>;
  revokeSession(sessionId: string): Promise<void>;
  findUserById(userId: string): Promise<AuthUser | null>;
  hasOperationalData(userId: string): Promise<boolean>;
}
