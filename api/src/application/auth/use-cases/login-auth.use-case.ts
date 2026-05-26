import type { LoginAuthInput } from "../../../domain/auth/entities/auth.entity.js";
import type { AuthRepository } from "../../../domain/auth/ports/auth.repository.js";
import { HttpError } from "../../../interfaces/http/middlewares/http-error.js";
import { buildAuthResponse } from "../services/build-auth-response.js";
import { generateSessionToken, hashSessionToken, verifyPassword } from "../services/auth-crypto.js";

export class LoginAuthUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionTtlDays: number
  ) {}

  async execute(input: LoginAuthInput) {
    const userRecord = await this.authRepository.findUserRecordByEmail(input.email);

    if (!userRecord || !verifyPassword(input.password, userRecord.passwordHash)) {
      throw new HttpError(401, "Invalid email or password");
    }

    if (userRecord.authStatus !== "active") {
      throw new HttpError(403, "User is not active");
    }

    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + this.sessionTtlDays * 24 * 60 * 60 * 1000).toISOString();
    const session = await this.authRepository.createSession(userRecord.id, hashSessionToken(token), expiresAt);
    const user = await this.authRepository.findUserById(userRecord.id);

    if (!user) {
      throw new HttpError(404, "User profile not found");
    }

    await this.authRepository.updateLastLoginAt(userRecord.id, new Date().toISOString());
    const hasOperationalData = await this.authRepository.hasOperationalData(userRecord.id);

    return buildAuthResponse(user, { ...session, token }, !hasOperationalData);
  }
}
