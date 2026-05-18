import type { PlannerAnalysisInput, PlannerAnalysisResponse } from "../entities/planner-analysis.entity.js";

export interface PlannerRepository {
  analyzeCampaign(input?: Partial<PlannerAnalysisInput>): Promise<PlannerAnalysisResponse>;
}
