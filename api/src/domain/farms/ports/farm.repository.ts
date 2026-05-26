import type { CreateFarmInput, Farm } from "../entities/farm.entity.js";

export interface FarmRepository {
  listByUserId(userId: string): Promise<Farm[]>;
  createFarm(userId: string, input: CreateFarmInput): Promise<Farm>;
  updateFarm(userId: string, farmId: string, input: Partial<CreateFarmInput>): Promise<Farm>;
  deleteFarm(userId: string, farmId: string): Promise<void>;
}
