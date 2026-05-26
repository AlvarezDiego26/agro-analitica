import { apiClient } from "../../../lib/api-client";
import type { PlannerAnalysis, PlannerAnalysisRequest } from "../types";

export async function getPlannerAnalysis(request: PlannerAnalysisRequest): Promise<PlannerAnalysis> {
  const params = new URLSearchParams({
    producto: request.producto,
    hectareas: String(request.hectareas),
    fechaSiembra: request.fechaSiembra,
    fechaCosecha: request.fechaCosecha ?? "",
    valle: request.valle,
    tipoMercado: request.tipoMercado
  });
  if (request.inversionPen !== undefined) {
    params.append("inversionPen", String(request.inversionPen));
  }

  return apiClient<PlannerAnalysis>({
    path: `/api/planner/analysis?${params.toString()}`
  });
}
