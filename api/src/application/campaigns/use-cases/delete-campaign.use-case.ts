import type { CampaignRepository } from "../../../domain/campaigns/ports/campaign.repository.js";
import type { AuthRepository } from "../../../domain/auth/ports/auth.repository.js";
import { HttpError } from "../../../interfaces/http/middlewares/http-error.js";
import { hashSessionToken } from "../../auth/services/auth-crypto.js";

type DeleteCampaignRequest = {
  campaignId: string;
  token: string;
};

export class DeleteCampaignUseCase {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly campaignRepo: CampaignRepository
  ) {}

  async execute(request: DeleteCampaignRequest): Promise<void> {
    const tokenHash = hashSessionToken(request.token);
    const session = await this.authRepo.findSessionByTokenHash(tokenHash);

    if (!session || session.revokedAt || new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new HttpError(401, "Invalid or expired session");
    }

    const campaign = await this.campaignRepo.getCampaignById(request.campaignId, session.userId);
    if (!campaign) {
      throw new HttpError(404, "Campaign not found");
    }

    await this.campaignRepo.deleteCampaign(request.campaignId, session.userId);
  }
}
