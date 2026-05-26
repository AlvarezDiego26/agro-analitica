"use client";

import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { UiCard } from "../../../components/ui/ui-card";
import { getPlannerAnalysis } from "../../planificador/services/get-planner-analysis";
import type { PlannerAlternative } from "../../planificador/types";
import { views } from "../../../config/views";
import { formatCurrency, formatSignedPercent } from "./dashboard-helpers";

export function DashboardAlternatives({ 
  layout = "horizontal",
  limit
}: { 
  layout?: "horizontal" | "vertical";
  limit?: number;
} = {}) {
  const router = useRouter();
  const [alternatives, setAlternatives] = useState<PlannerAlternative[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPlannerAnalysis({
      producto: "",
      hectareas: 4.0,
      fechaSiembra: new Date().toISOString().split("T")[0],
      valle: "Arequipa",
      tipoMercado: "exportacion"
    })
      .then((res) => {
        if (isMounted) {
          setAlternatives(res.result?.recommendedAlternatives || []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !alternatives || alternatives.length === 0) {
    return null;
  }

  const gridClass = layout === "horizontal" 
    ? "grid grid-cols-1 md:grid-cols-3 gap-3" 
    : "flex flex-col gap-3";

  const displayAlternatives = limit ? alternatives.slice(0, limit) : alternatives;

  return (
    <div className={layout === "horizontal" ? "mt-2" : ""}>
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Alternativas recomendadas</h3>
          <p className="text-[13px] font-medium text-gray-400">Cultivos con mejor ROI proyectado para tu región</p>
        </div>
      </div>

      <div className={gridClass}>
        {displayAlternatives.map((item) => (
          <UiCard
            key={item.producto}
            className={`flex h-[150px] cursor-pointer flex-col justify-between p-5 shadow-sm transition-all duration-300 ${
              item.riskLevel === "medium"
                ? "hover:border-amber-300 hover:shadow-md"
                : "hover:border-emerald-300 hover:shadow-md"
            }`}
            onClick={() => router.push(`${views.planner}?crop=${encodeURIComponent(item.producto)}`)}
          >
            <div>
              <div className="mb-2 flex items-start justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Sprout size={16} strokeWidth={2.5} />
                </span>
                <span className="text-[13px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{formatSignedPercent(item.estimatedRoi)}</span>
              </div>
              <h4 className="text-[15px] font-bold leading-tight text-gray-900">{item.producto}</h4>
              <p className="mt-1 text-[12px] font-medium text-gray-500 line-clamp-2 leading-relaxed">{item.message}</p>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  item.riskLevel === "medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${item.riskLevel === "medium" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                {item.riskLabel}
              </span>
              <strong className="text-[15px] font-black text-gray-900">
                {formatCurrency(item.projectedPricePen)}
                <span className="text-[11px] font-bold text-gray-400">/kg</span>
              </strong>
            </div>
          </UiCard>
        ))}
      </div>
    </div>
  );
}
