import type { Campaign, CreateCampaignInput } from "../../../../domain/campaigns/entities/campaign.entity.js";
import type { CampaignRepository } from "../../../../domain/campaigns/ports/campaign.repository.js";
import { SupabaseRestClient } from "../clients/supabase-rest-client.js";

type CampaignRow = {
  id: string;
  user_id: string;
  farm_id: string | null;
  parcel_id: string | null;
  crop_name: string;
  sowing_date: string;
  estimated_harvest_date: string | null;
  hectares: number;
  market_type: "local" | "exportacion" | "industrial";
  campaign_status: "draft" | "planned" | "active" | "completed" | "cancelled";
  estimated_roi_pct: number | null;
  estimated_investment_pen: number | null;
  planner_risk_level: "low" | "medium" | "high" | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseCampaignRepository implements CampaignRepository {
  constructor(private readonly client: SupabaseRestClient) {}

  async createCampaign(userId: string, input: CreateCampaignInput): Promise<Campaign> {
    const rows = await this.client.request<CampaignRow[]>("campaigns", {
      method: "POST",
      body: [
        {
          user_id: userId,
          farm_id: input.farmId ?? null,
          parcel_id: input.parcelId ?? null,
          crop_name: input.cropName,
          sowing_date: input.sowingDate,
          hectares: input.hectares,
          market_type: input.marketType ?? "local",
          campaign_status: input.campaignStatus ?? "draft",
          estimated_roi_pct: input.estimatedRoiPct ?? null,
          estimated_investment_pen: input.estimatedInvestmentPen ?? null,
          planner_risk_level: input.plannerRiskLevel ?? null
        }
      ]
    });

    return mapCampaign(rows[0]);
  }

  async listByUserId(userId: string): Promise<Campaign[]> {
    const rows = await this.client.request<CampaignRow[]>("campaigns", {
      query: {
        select: "id,user_id,farm_id,parcel_id,crop_name,sowing_date,estimated_harvest_date,hectares,market_type,campaign_status,estimated_roi_pct,estimated_investment_pen,planner_risk_level,created_at,updated_at",
        user_id: `eq.${userId}`
      }
    });

    return rows.map(mapCampaign);
  }

  async updateCampaign(campaignId: string, userId: string, input: Partial<CreateCampaignInput>): Promise<Campaign> {
    const updates: Partial<CampaignRow> = {};
    if (input.cropName !== undefined) updates.crop_name = input.cropName;
    if (input.hectares !== undefined) updates.hectares = input.hectares;
    if (input.campaignStatus !== undefined) updates.campaign_status = input.campaignStatus;
    if (input.estimatedInvestmentPen !== undefined) updates.estimated_investment_pen = input.estimatedInvestmentPen;
    if (input.sowingDate !== undefined) updates.sowing_date = input.sowingDate;

    const rows = await this.client.request<CampaignRow[]>("campaigns", {
      method: "PATCH",
      query: {
        id: `eq.${campaignId}`,
        user_id: `eq.${userId}`
      },
      body: updates
    });

    return mapCampaign(rows[0]);
  }

  async deleteCampaign(campaignId: string, userId: string): Promise<void> {
    await this.client.request("campaigns", {
      method: "DELETE",
      query: {
        id: `eq.${campaignId}`,
        user_id: `eq.${userId}`
      }
    });
  }

  async getCampaignById(campaignId: string, userId: string): Promise<Campaign | null> {
    const rows = await this.client.request<CampaignRow[]>("campaigns", {
      query: {
        select: "id,user_id,farm_id,parcel_id,crop_name,sowing_date,estimated_harvest_date,hectares,market_type,campaign_status,estimated_roi_pct,estimated_investment_pen,planner_risk_level,created_at,updated_at",
        id: `eq.${campaignId}`,
        user_id: `eq.${userId}`
      }
    });

    if (!rows || rows.length === 0) return null;
    return mapCampaign(rows[0]);
  }
}

function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    farmId: row.farm_id,
    parcelId: row.parcel_id,
    cropName: row.crop_name,
    sowingDate: row.sowing_date,
    estimatedHarvestDate: row.estimated_harvest_date,
    hectares: Number(row.hectares),
    marketType: row.market_type,
    campaignStatus: row.campaign_status,
    estimatedRoiPct: row.estimated_roi_pct ? Number(row.estimated_roi_pct) : null,
    estimatedInvestmentPen: row.estimated_investment_pen ? Number(row.estimated_investment_pen) : null,
    plannerRiskLevel: row.planner_risk_level,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
