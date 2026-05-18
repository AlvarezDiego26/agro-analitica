import type { PlannerAnalysisInput, PlannerAnalysisResponse } from "../../../../domain/planner/entities/planner-analysis.entity.js";
import type { PlannerRepository } from "../../../../domain/planner/ports/planner.repository.js";
import { loadEnv } from "../../../config/env.js";
import { PostgresQueryExecutor } from "../clients/postgres-query-executor.js";

type PlannerAggregateRow = {
  average_price: number | string | null;
  latest_price: number | string | null;
  min_price: number | string | null;
  max_price: number | string | null;
  average_volume_ton: number | string | null;
  records: number | string;
  latest_date: string | null;
};

export class PostgresPlannerRepository implements PlannerRepository {
  private readonly schema = loadEnv().postgres.schema;

  constructor(private readonly queryExecutor: PostgresQueryExecutor) {}

  async analyzeCampaign(input?: Partial<PlannerAnalysisInput>): Promise<PlannerAnalysisResponse> {
    const producto = input?.producto?.trim() || "Ajo";
    const hectareas = input?.hectareas ?? 4;
    const fechaSiembra = input?.fechaSiembra ?? "2026-04-15";
    const valle = input?.valle?.trim() || "Pisco";

    const [row] = await this.queryExecutor.execute<PlannerAggregateRow>(
      `
        SELECT
          average_price,
          latest_price,
          min_price,
          max_price,
          average_volume_ton,
          records,
          latest_date
        FROM ${this.schema}.planner_product_analysis
        WHERE producto_key ILIKE $1
        ORDER BY records DESC
        LIMIT 1
      `,
      [`%${producto}%`]
    );

    const averagePrice = Number(row?.average_price ?? 0);
    const latestPrice =
      row?.latest_price !== null && row?.latest_price !== undefined ? Number(row.latest_price) : null;
    const maxPrice = row?.max_price !== null && row?.max_price !== undefined ? Number(row.max_price) : null;
    const averageVolumeTon =
      row?.average_volume_ton !== null && row?.average_volume_ton !== undefined
        ? Number(row.average_volume_ton)
        : null;

    const roiBase = maxPrice && maxPrice > 0 ? ((averagePrice - maxPrice) / maxPrice) * 100 : 0;
    const estimatedRoi = Number((roiBase - Math.max(hectareas - 3, 0) * 1.2).toFixed(0));

    const riskLevel: PlannerAnalysisResponse["result"]["riskLevel"] =
      estimatedRoi <= -10 ? "high" : estimatedRoi <= 5 ? "medium" : "low";

    const title = riskLevel === "high" ? "ALTO" : riskLevel === "medium" ? "MEDIO" : "BAJO";
    const summary =
      riskLevel === "high"
        ? "No recomendado en esta ventana"
        : riskLevel === "medium"
          ? "Conviene validar mas senales antes de sembrar"
          : "Ventana razonable segun el precio reciente";

    const explanation = `SISAP muestra ${Number(row?.records ?? 0)} registros recientes para ${producto}. El precio promedio del periodo es S/ ${averagePrice.toFixed(
      2
    )}, con ultimo precio ${latestPrice?.toFixed(2) ?? "0.00"} y volumen promedio ${
      averageVolumeTon !== null ? `${averageVolumeTon.toFixed(2)} tn` : "sin dato de volumen"
    }.`;

    return {
      input: {
        producto,
        hectareas,
        fechaSiembra,
        valle
      },
      result: {
        riskLevel,
        estimatedRoi,
        averagePrice,
        latestPrice,
        averageVolumeTon,
        title,
        summary,
        explanation
      }
    };
  }
}
