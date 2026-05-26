type AuthUserProfile = {
  fullName: string;
  phone: string | null;
  regionCode: string | null;
  valleyName: string | null;
  producerType: string | null;
  primaryCrop: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  authStatus: "active" | "disabled" | "pending";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile: AuthUserProfile;
};

export type AuthSession = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
};

export type AuthSessionRecord = {
  id: string;
  userId: string;
  sessionTokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type AuthUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  authStatus: "active" | "disabled" | "pending";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAuthInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  regionCode?: string | null;
  valleyName?: string | null;
  producerType?: string | null;
  primaryCrop?: string | null;
};

export type LoginAuthInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
  isNewUser: boolean;
  user: AuthUser;
};
