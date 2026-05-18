import type { PlannerAnalysisInput, PlannerAnalysisResponse } from "../../../domain/planner/entities/planner-analysis.entity.js";
import type { PlannerRepository } from "../../../domain/planner/ports/planner.repository.js";

export class AnalyzeCampaignUseCase {
  constructor(private readonly plannerRepository: PlannerRepository) {}

  async execute(input?: Partial<PlannerAnalysisInput>): Promise<PlannerAnalysisResponse> {
    return this.plannerRepository.analyzeCampaign(input);
  }
}
