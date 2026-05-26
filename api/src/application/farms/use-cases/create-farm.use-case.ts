import type { AuthRepository } from "../../../domain/auth/ports/auth.repository.js";
import type { CreateFarmInput } from "../../../domain/farms/entities/farm.entity.js";
import type { FarmRepository } from "../../../domain/farms/ports/farm.repository.js";
import { HttpError } from "../../../interfaces/http/middlewares/http-error.js";
import { hashSessionToken } from "../../auth/services/auth-crypto.js";

export class CreateFarmUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly farmRepository: FarmRepository
  ) {}

  async execute(token: string, input: CreateFarmInput) {
    const tokenHash = hashSessionToken(token);
    const session = await this.authRepository.findSessionByTokenHash(tokenHash);

    if (!session || session.revokedAt) {
      throw new HttpError(401, "Invalid session");
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new HttpError(401, "Session expired");
    }

    const farm = await this.farmRepository.createFarm(session.userId, input);

    return {
      farm
    };
  }
}
