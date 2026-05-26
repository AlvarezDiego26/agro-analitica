import type { AuthRepository } from "../../../domain/auth/ports/auth.repository.js";
import { HttpError } from "../../../interfaces/http/middlewares/http-error.js";
import { hashSessionToken } from "../services/auth-crypto.js";

export class GetCurrentAuthUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(token: string) {
    const tokenHash = hashSessionToken(token);
    const session = await this.authRepository.findSessionByTokenHash(tokenHash);

    if (!session) {
      throw new HttpError(401, "Invalid session");
    }

    if (session.revokedAt) {
      throw new HttpError(401, "Session revoked");
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new HttpError(401, "Session expired");
    }

    const user = await this.authRepository.findUserById(session.userId);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const hasOperationalData = await this.authRepository.hasOperationalData(user.id);

    return {
      isNewUser: !hasOperationalData,
      user
    };
  }
}
