import type { RegisterAuthInput } from "../../../domain/auth/entities/auth.entity.js";
import type { AuthRepository } from "../../../domain/auth/ports/auth.repository.js";
import { HttpError } from "../../../interfaces/http/middlewares/http-error.js";
import { buildAuthResponse } from "../services/build-auth-response.js";
import { generateSessionToken, hashPassword, hashSessionToken } from "../services/auth-crypto.js";

export class RegisterAuthUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionTtlDays: number
  ) {}

  async execute(input: RegisterAuthInput) {
    const existingUser = await this.authRepository.findUserRecordByEmail(input.email);

    if (existingUser) {
      throw new HttpError(409, "Email already registered");
    }

    const passwordHash = hashPassword(input.password);
    const user = await this.authRepository.createUser(input, passwordHash);
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + this.sessionTtlDays * 24 * 60 * 60 * 1000).toISOString();
    const session = await this.authRepository.createSession(user.id, hashSessionToken(token), expiresAt);

    return buildAuthResponse(user, { ...session, token }, true);
  }
}
