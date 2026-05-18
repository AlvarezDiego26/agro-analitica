import { apiClient } from "../../../lib/api-client";
import type { PlannerAnalysis } from "../types";

export async function getPlannerAnalysis(): Promise<PlannerAnalysis> {
  try {
    return await apiClient<PlannerAnalysis>({
      path: "/api/planner/analysis?producto=Ajo&hectareas=4&fechaSiembra=2026-04-15&valle=Pisco"
    });
  } catch {
    return {
      input: {
        producto: "Ajo",
        hectareas: 4,
        fechaSiembra: "2026-04-15",
        valle: "Pisco"
      },
      result: {
        riskLevel: "high",
        estimatedRoi: -12,
        averagePrice: 6.42,
        latestPrice: 7.63,
        averageVolumeTon: 67.05,
        title: "ALTO",
        summary: "No recomendado en esta ventana",
        explanation:
          "SISAP muestra actividad reciente para Ajo y una senal de retorno debil para esta combinacion base. Usa el analisis vivo con la API encendida para obtener el calculo actualizado."
      }
    };
  }
}
