import type {
  PlannerAlternativeCandidate,
  PlannerPriceProjectionPoint,
  PlannerProductAnalysisSnapshot
} from "../entities/planner-analysis.entity.js";

export interface PlannerRepository {
  findProductAnalysis(producto: string, valle: string): Promise<PlannerProductAnalysisSnapshot | null>;
  findPriceProjection(productoKey: string, valle: string): Promise<PlannerPriceProjectionPoint[]>;
  findRecommendedAlternatives(productoKey: string, valle: string): Promise<PlannerAlternativeCandidate[]>;
  findRegionalAlternatives(valle: string): Promise<PlannerAlternativeCandidate[]>;
}
