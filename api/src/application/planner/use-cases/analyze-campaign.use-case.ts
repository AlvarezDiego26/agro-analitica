import type { PlannerAnalysisInput, PlannerAnalysisResponse } from "../../../domain/planner/entities/planner-analysis.entity.js";
import type { PlannerRepository } from "../../../domain/planner/ports/planner.repository.js";
import { buildPlannerAnalysisResult } from "../services/build-planner-analysis-result.js";

export class AnalyzeCampaignUseCase {
  constructor(private readonly plannerRepository: PlannerRepository) {}

  async execute(input?: Partial<PlannerAnalysisInput>): Promise<PlannerAnalysisResponse> {
    const normalizedInput = normalizeInput(input);

    if (!normalizedInput.producto) {
      const recommendedAlternatives = await this.plannerRepository.findRegionalAlternatives(normalizedInput.valle);

      return buildPlannerAnalysisResult(
        normalizedInput,
        {
          productoKey: "",
          averagePrice: 0,
          latestPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          averageVolumeTon: 0,
          records: 0,
          latestDate: "",
          estimatedRoi: 0,
          riskLevel: "low",
          title: "INICIO",
          summary: "Sin cultivo seleccionado",
          explanation: "Selecciona un cultivo para ver su proyeccion detallada y el analisis de mercado de la IA."
        },
        {
          recommendedAlternatives
        }
      );
    }

    const analysis = await this.plannerRepository.findProductAnalysis(normalizedInput.producto, normalizedInput.valle);
    const productoKey = analysis?.productoKey ?? normalizedInput.producto.toLowerCase();
    const [priceProjection, recommendedAlternatives] = await Promise.all([
      this.plannerRepository.findPriceProjection(productoKey, normalizedInput.valle),
      this.plannerRepository.findRecommendedAlternatives(productoKey, normalizedInput.valle)
    ]);

    return buildPlannerAnalysisResult(normalizedInput, analysis, {
      priceProjection,
      recommendedAlternatives
    });
  }
}

function normalizeInput(input?: Partial<PlannerAnalysisInput>): PlannerAnalysisInput {
  const fechaSiembra = input?.fechaSiembra || new Date().toISOString().split("T")[0];
  const defaultHarvestDate = new Date(fechaSiembra);
  defaultHarvestDate.setMonth(defaultHarvestDate.getMonth() + 4);

  return {
    producto: input?.producto?.trim() || "",
    hectareas: input?.hectareas ?? 4,
    fechaSiembra,
    fechaCosecha: input?.fechaCosecha || defaultHarvestDate.toISOString().split("T")[0],
    valle: input?.valle?.trim() || "Pisco",
    tipoMercado: input?.tipoMercado?.trim() || "exportacion",
    inversionPen: input?.inversionPen
  };
}
