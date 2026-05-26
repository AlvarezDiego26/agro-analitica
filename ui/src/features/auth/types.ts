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
  token: string;
  expiresAt: string;
};

export type AuthResult = {
  token: string;
  expiresAt: string;
  isNewUser: boolean;
  user: AuthUser;
};

export type AuthMeResult = {
  isNewUser: boolean;
  user: AuthUser;
};
