import type { CampaignRepository } from "../../../domain/campaigns/ports/campaign.repository.js";
import type { AuthRepository } from "../../../domain/auth/ports/auth.repository.js";
import type { Campaign, CreateCampaignInput } from "../../../domain/campaigns/entities/campaign.entity.js";
import { HttpError } from "../../../interfaces/http/middlewares/http-error.js";
import { hashSessionToken } from "../../auth/services/auth-crypto.js";

type UpdateCampaignRequest = {
  campaignId: string;
  token: string;
  input: Partial<CreateCampaignInput>;
};

export class UpdateCampaignUseCase {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly campaignRepo: CampaignRepository
  ) {}

  async execute(request: UpdateCampaignRequest): Promise<Campaign> {
    const tokenHash = hashSessionToken(request.token);
    const session = await this.authRepo.findSessionByTokenHash(tokenHash);

    if (!session || session.revokedAt || new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new HttpError(401, "Invalid or expired session");
    }

    const campaign = await this.campaignRepo.getCampaignById(request.campaignId, session.userId);
    if (!campaign) {
      throw new HttpError(404, "Campaign not found");
    }

    return this.campaignRepo.updateCampaign(request.campaignId, session.userId, request.input);
  }
}
