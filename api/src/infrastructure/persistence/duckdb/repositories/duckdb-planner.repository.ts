import type { PlannerAnalysisInput, PlannerAnalysisResponse } from "../../../../domain/planner/entities/planner-analysis.entity.js";
import type { PlannerRepository } from "../../../../domain/planner/ports/planner.repository.js";
import { DuckDbQueryExecutor } from "../clients/duckdb-query-executor.js";

type PlannerAggregateRow = {
  averagePrice: number | string | null;
  latestPrice: number | string | null;
  minPrice: number | string | null;
  maxPrice: number | string | null;
  averageVolumeTon: number | string | null;
  records: number | string;
  latestDate: string | null;
};

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

export class DuckDbPlannerRepository implements PlannerRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async analyzeCampaign(input?: Partial<PlannerAnalysisInput>): Promise<PlannerAnalysisResponse> {
    const producto = input?.producto?.trim() || "Ajo";
    const hectareas = input?.hectareas ?? 4;
    const fechaSiembra = input?.fechaSiembra ?? "2026-04-15";
    const valle = input?.valle?.trim() || "Pisco";

    const [row] = await this.queryExecutor.execute<PlannerAggregateRow>(`
      SELECT
        averagePrice,
        latestPrice,
        minPrice,
        maxPrice,
        averageVolumeTon,
        records,
        CAST(latestDate AS VARCHAR) AS latestDate
      FROM planner_product_cache
      WHERE producto_key LIKE LOWER('%${escapeSqlLiteral(producto)}%')
      ORDER BY records DESC
      LIMIT 1
    `);

    const averagePrice = Number(row?.averagePrice ?? 0);
    const latestPrice = row?.latestPrice !== null && row?.latestPrice !== undefined ? Number(row.latestPrice) : null;
    const maxPrice = row?.maxPrice !== null && row?.maxPrice !== undefined ? Number(row.maxPrice) : null;
    const averageVolumeTon =
      row?.averageVolumeTon !== null && row?.averageVolumeTon !== undefined ? Number(row.averageVolumeTon) : null;

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
