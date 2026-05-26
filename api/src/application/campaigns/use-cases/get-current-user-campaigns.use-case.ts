import type { AuthRepository } from "../../../domain/auth/ports/auth.repository.js";
import type { CampaignRepository } from "../../../domain/campaigns/ports/campaign.repository.js";
import { HttpError } from "../../../interfaces/http/middlewares/http-error.js";
import { hashSessionToken } from "../../auth/services/auth-crypto.js";

export class GetCurrentUserCampaignsUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly campaignRepository: CampaignRepository
  ) {}

  async execute(token: string) {
    const tokenHash = hashSessionToken(token);
    const session = await this.authRepository.findSessionByTokenHash(tokenHash);

    if (!session || session.revokedAt) {
      throw new HttpError(401, "Invalid session");
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new HttpError(401, "Session expired");
    }

    const campaigns = await this.campaignRepository.listByUserId(session.userId);

    return {
      campaigns
    };
  }
}
