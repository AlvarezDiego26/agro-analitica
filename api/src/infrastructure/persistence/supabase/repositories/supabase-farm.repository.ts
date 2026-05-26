import type { CreateFarmInput, Farm } from "../../../../domain/farms/entities/farm.entity.js";
import type { FarmRepository } from "../../../../domain/farms/ports/farm.repository.js";
import { SupabaseRestClient } from "../clients/supabase-rest-client.js";

type FarmRow = {
  id: string;
  user_id: string;
  farm_name: string;
  region_code: string;
  province_name: string | null;
  district_name: string | null;
  location_label: string | null;
  total_hectares: number | string;
  water_source: string | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseFarmRepository implements FarmRepository {
  constructor(private readonly client: SupabaseRestClient) {}

  async listByUserId(userId: string): Promise<Farm[]> {
    const rows = await this.client.request<FarmRow[]>("farms", {
      query: {
        select: "id,user_id,farm_name,region_code,province_name,district_name,location_label,total_hectares,water_source,created_at,updated_at",
        user_id: `eq.${userId}`,
        order: "created_at.desc"
      }
    });

    return rows.map(mapFarm);
  }

  async createFarm(userId: string, input: CreateFarmInput): Promise<Farm> {
    const rows = await this.client.request<FarmRow[]>("farms", {
      method: "POST",
      body: [
        {
          user_id: userId,
          farm_name: input.farmName,
          region_code: input.regionCode,
          province_name: input.provinceName ?? null,
          district_name: input.districtName ?? null,
          location_label: input.locationLabel ?? null,
          total_hectares: input.totalHectares,
          water_source: input.waterSource ?? null
        }
      ]
    });

    return mapFarm(rows[0]);
  }
  async updateFarm(userId: string, farmId: string, input: Partial<CreateFarmInput>): Promise<Farm> {
    const updateBody: Partial<FarmRow> = {};
    if (input.farmName !== undefined) updateBody.farm_name = input.farmName;
    if (input.regionCode !== undefined) updateBody.region_code = input.regionCode;
    if (input.provinceName !== undefined) updateBody.province_name = input.provinceName ?? null;
    if (input.districtName !== undefined) updateBody.district_name = input.districtName ?? null;
    if (input.locationLabel !== undefined) updateBody.location_label = input.locationLabel ?? null;
    if (input.totalHectares !== undefined) updateBody.total_hectares = input.totalHectares;
    if (input.waterSource !== undefined) updateBody.water_source = input.waterSource ?? null;

    const rows = await this.client.request<FarmRow[]>("farms", {
      method: "PATCH",
      body: updateBody,
      query: {
        id: `eq.${farmId}`,
        user_id: `eq.${userId}`,
        select: "id,user_id,farm_name,region_code,province_name,district_name,location_label,total_hectares,water_source,created_at,updated_at"
      }
    });

    if (rows.length === 0) {
      throw new Error("Farm not found or unauthorized");
    }

    return mapFarm(rows[0]);
  }

  async deleteFarm(userId: string, farmId: string): Promise<void> {
    const rows = await this.client.request<FarmRow[]>("farms", {
      method: "DELETE",
      query: {
        id: `eq.${farmId}`,
        user_id: `eq.${userId}`,
        select: "id"
      }
    });

    if (rows.length === 0) {
      throw new Error("Farm not found or unauthorized");
    }
  }
}

function mapFarm(row: FarmRow): Farm {
  return {
    id: row.id,
    userId: row.user_id,
    farmName: row.farm_name,
    regionCode: row.region_code,
    provinceName: row.province_name,
    districtName: row.district_name,
    locationLabel: row.location_label,
    totalHectares: Number(row.total_hectares),
    waterSource: row.water_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
