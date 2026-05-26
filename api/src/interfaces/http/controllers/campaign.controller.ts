import type { Request, Response } from "express";
import { CreateCampaignUseCase } from "../../../application/campaigns/use-cases/create-campaign.use-case.js";
import { GetCurrentUserCampaignsUseCase } from "../../../application/campaigns/use-cases/get-current-user-campaigns.use-case.js";
import { UpdateCampaignUseCase } from "../../../application/campaigns/use-cases/update-campaign.use-case.js";
import { DeleteCampaignUseCase } from "../../../application/campaigns/use-cases/delete-campaign.use-case.js";

export class CampaignController {
  constructor(
    private readonly createCampaignUseCase: CreateCampaignUseCase,
    private readonly getCurrentUserCampaignsUseCase: GetCurrentUserCampaignsUseCase,
    private readonly updateCampaignUseCase: UpdateCampaignUseCase,
    private readonly deleteCampaignUseCase: DeleteCampaignUseCase
  ) {}

  async listCurrentUserCampaigns(request: Request, response: Response) {
    const result = await this.getCurrentUserCampaignsUseCase.execute(request.authToken as string);
    return response.status(200).json(result);
  }

  async createCampaign(request: Request, response: Response) {
    const result = await this.createCampaignUseCase.execute(request.authToken as string, request.validatedBody as never);
    return response.status(201).json({ campaign: result });
  }

  async updateCampaign(request: Request, response: Response) {
    const campaignId = request.params.id as string;
    const result = await this.updateCampaignUseCase.execute({
      campaignId,
      token: request.authToken as string,
      input: request.body
    });
    return response.status(200).json({ campaign: result });
  }

  async deleteCampaign(request: Request, response: Response) {
    const campaignId = request.params.id as string;
    await this.deleteCampaignUseCase.execute({
      campaignId,
      token: request.authToken as string
    });
    return response.status(204).send();
  }
}
