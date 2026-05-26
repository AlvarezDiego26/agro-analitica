import type { Campaign, CreateCampaignInput } from "../entities/campaign.entity.js";

export interface CampaignRepository {
  createCampaign(userId: string, input: CreateCampaignInput): Promise<Campaign>;
  listByUserId(userId: string): Promise<Campaign[]>;
  updateCampaign(campaignId: string, userId: string, input: Partial<CreateCampaignInput>): Promise<Campaign>;
  deleteCampaign(campaignId: string, userId: string): Promise<void>;
  getCampaignById(campaignId: string, userId: string): Promise<Campaign | null>;
}
