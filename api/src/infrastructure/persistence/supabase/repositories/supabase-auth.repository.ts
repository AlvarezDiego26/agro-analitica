import type {
  AuthSession,
  AuthSessionRecord,
  AuthUser,
  AuthUserRecord,
  RegisterAuthInput
} from "../../../../domain/auth/entities/auth.entity.js";
import type { AuthRepository } from "../../../../domain/auth/ports/auth.repository.js";
import { SupabaseRestClient } from "../clients/supabase-rest-client.js";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  auth_status: "active" | "disabled" | "pending";
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  user_id: string;
  full_name: string;
  phone: string | null;
  region_code: string | null;
  valley_name: string | null;
  producer_type: string | null;
  primary_crop: string | null;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  session_token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
};

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: SupabaseRestClient) {}

  async findUserRecordByEmail(email: string): Promise<AuthUserRecord | null> {
    const rows = await this.client.request<UserRow[]>("users", {
      query: {
        select: "id,email,password_hash,auth_status,last_login_at,created_at,updated_at",
        email: `eq.${email}`,
        limit: 1
      }
    });

    if (!rows.length) {
      return null;
    }

    return mapUserRecord(rows[0]);
  }

  async createUser(input: RegisterAuthInput, passwordHash: string): Promise<AuthUser> {
    const userRows = await this.client.request<UserRow[]>("users", {
      method: "POST",
      body: [
        {
          email: input.email,
          password_hash: passwordHash,
          auth_status: "active"
        }
      ]
    });

    const userRow = userRows[0];

    await this.client.request<ProfileRow[]>("profiles", {
      method: "POST",
      body: [
        {
          user_id: userRow.id,
          full_name: input.fullName,
          phone: input.phone ?? null,
          region_code: input.regionCode ?? null,
          valley_name: input.valleyName ?? null,
          producer_type: input.producerType ?? null,
          primary_crop: input.primaryCrop ?? null
        }
      ]
    });

    const user = await this.findUserById(userRow.id);

    if (!user) {
      throw new Error("User profile could not be loaded after creation");
    }

    return user;
  }

  async createSession(userId: string, tokenHash: string, expiresAt: string): Promise<AuthSession> {
    const rows = await this.client.request<SessionRow[]>("user_sessions", {
      method: "POST",
      body: [
        {
          user_id: userId,
          session_token_hash: tokenHash,
          expires_at: expiresAt
        }
      ]
    });

    return {
      id: rows[0].id,
      userId,
      token: "",
      expiresAt: rows[0].expires_at
    };
  }

  async updateLastLoginAt(userId: string, lastLoginAt: string): Promise<void> {
    await this.client.request<UserRow[]>("users", {
      method: "PATCH",
      query: {
        id: `eq.${userId}`
      },
      body: {
        last_login_at: lastLoginAt
      }
    });
  }

  async findSessionByTokenHash(tokenHash: string): Promise<AuthSessionRecord | null> {
    const rows = await this.client.request<SessionRow[]>("user_sessions", {
      query: {
        select: "id,user_id,session_token_hash,expires_at,revoked_at,created_at",
        session_token_hash: `eq.${tokenHash}`,
        limit: 1
      }
    });

    if (!rows.length) {
      return null;
    }

    return {
      id: rows[0].id,
      userId: rows[0].user_id,
      sessionTokenHash: rows[0].session_token_hash,
      expiresAt: rows[0].expires_at,
      revokedAt: rows[0].revoked_at
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.client.request<SessionRow[]>("user_sessions", {
      method: "PATCH",
      query: {
        id: `eq.${sessionId}`
      },
      body: {
        revoked_at: new Date().toISOString()
      }
    });
  }

  async findUserById(userId: string): Promise<AuthUser | null> {
    const userRows = await this.client.request<UserRow[]>("users", {
      query: {
        select: "id,email,auth_status,last_login_at,created_at,updated_at",
        id: `eq.${userId}`,
        limit: 1
      }
    });

    if (!userRows.length) {
      return null;
    }

    const profileRows = await this.client.request<ProfileRow[]>("profiles", {
      query: {
        select: "user_id,full_name,phone,region_code,valley_name,producer_type,primary_crop,created_at,updated_at",
        user_id: `eq.${userId}`,
        limit: 1
      }
    });

    if (!profileRows.length) {
      return null;
    }

    return mapUser(userRows[0], profileRows[0]);
  }

  async hasOperationalData(userId: string): Promise<boolean> {
    const rows = await this.client.request<Array<{ id: string }>>("farms", {
      query: {
        select: "id",
        user_id: `eq.${userId}`,
        limit: 1
      }
    });

    return rows.length > 0;
  }
}

function mapUserRecord(row: UserRow): AuthUserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    authStatus: row.auth_status,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapUser(user: Omit<UserRow, "password_hash"> | UserRow, profile: ProfileRow): AuthUser {
  return {
    id: user.id,
    email: user.email,
    authStatus: user.auth_status,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    profile: {
      fullName: profile.full_name,
      phone: profile.phone,
      regionCode: profile.region_code,
      valleyName: profile.valley_name,
      producerType: profile.producer_type,
      primaryCrop: profile.primary_crop
    }
  };
}
