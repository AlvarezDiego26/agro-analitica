import { ArrowDown, ArrowUp } from "lucide-react";
import type { HomeShowcaseResponse } from "../../showcase/types";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercent,
  riskBadgeClassName,
  riskDotClassName,
  progressClassName,
  deltaTextClassName,
} from "./dashboard-helpers";

export function DashboardActiveCampaigns({ 
  featuredProducts, 
  summary 
}: Readonly<{ 
  featuredProducts: HomeShowcaseResponse["featuredCampaigns"];
  summary: HomeShowcaseResponse["summary"];
}>) {
  return (
    <section className="col-span-1 xl:col-span-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1 mt-1">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">
            {summary.stats.activeHectares > 0 ? "Mis campañas activas" : "Sugerencias de cultivos"}
          </h3>
          <p className="text-[13px] font-medium text-gray-400">
            {summary.stats.activeHectares > 0 
              ? `${featuredProducts.length} cultivos · ${formatCompactNumber(summary.stats.activeHectares)} ha`
              : "Basado en tu región y temporada"}
          </p>
        </div>
        <a href={views.planner} className="text-[13px] font-bold text-[#208843] hover:text-[#156E3F] transition-colors">
          Ver todas &gt;
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xl:gap-4 h-full">
        {featuredProducts.map((product) => (
          <UiCard key={product.name} className="flex flex-col justify-between hover:border-emerald-200 transition-colors p-5 shadow-sm border-gray-200">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between gap-2 items-start">
                <div>
                  <h4 className="text-[15px] leading-tight font-bold text-gray-900">{product.name}</h4>
                  <p className="text-[12px] text-gray-400 mt-1 font-medium">{product.codeLabel}</p>
                </div>
                <span className={riskBadgeClassName(product.riskLevel)}>
                  <span className={`w-1.5 h-1.5 rounded-full ${riskDotClassName(product.riskLevel)}`}></span>
                  {product.riskLabel}
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>{product.stageLabel}</span>
                  <span>{product.harvestWindowLabel}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <span
                    className={`block h-full rounded-full ${progressClassName(product.riskLevel)}`}
                    style={{ width: `${product.progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end mt-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-0.5">
                  PRECIO PROYECTADO
                </p>
                <strong className="text-[22px] font-black text-gray-900 tracking-tight">
                  {formatCurrency(product.projectedPricePen)}
                  <span className="text-[13px] font-bold text-gray-400">/kg</span>
                </strong>
              </div>
              {product.deltaDirection !== "none" && (
                <span className={`inline-flex items-center gap-0.5 font-bold text-[12px] ${deltaTextClassName(product.deltaDirection)}`}>
                  {product.deltaDirection === "down" ? <ArrowDown size={14} strokeWidth={3} /> : <ArrowUp size={14} strokeWidth={3} />}
                  {formatPercent(product.deltaPct)}
                </span>
              )}
            </div>
          </UiCard>
        ))}
      </div>
    </section>
  );
}
