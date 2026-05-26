import type { AuthRepository } from "../../../domain/auth/ports/auth.repository.js";
import { HttpError } from "../../../interfaces/http/middlewares/http-error.js";
import { hashSessionToken } from "../services/auth-crypto.js";

export class LogoutAuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(token: string) {
    const tokenHash = hashSessionToken(token);
    const session = await this.authRepository.findSessionByTokenHash(tokenHash);

    if (!session) {
      throw new HttpError(401, "Invalid session");
    }

    await this.authRepository.revokeSession(session.id);

    return { success: true };
  }
}
