import { AlertTriangle, ArrowUp } from "lucide-react";
import type { HomeShowcaseResponse } from "../../showcase/types";
import { UiCard } from "../../../components/ui/ui-card";
import { formatCompactNumber, formatMoneyCompact, formatSignedPercent } from "./dashboard-helpers";

export function DashboardMetrics({ summary }: Readonly<{ summary: HomeShowcaseResponse["summary"] }>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5">
      <UiCard tone="alert" className="flex flex-col justify-center py-4 xl:py-5 border-red-200 bg-[#FFF5F5]">
        <div className="flex gap-4 items-start">
          <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#DC2626] text-white shadow-sm mt-1">
            <AlertTriangle size={20} strokeWidth={2.5} />
          </span>
          <div className="pt-0.5">
            <p className="text-[10px] font-black tracking-widest uppercase text-[#DC2626] mb-1">
              ALERTA REGIONAL
            </p>
            <h2 className="text-[14px] leading-tight font-bold text-[#7F1D1D] mb-1.5 pr-2">
              {summary.alert.title}
            </h2>
            <p className="text-[11px] leading-relaxed text-[#B91C1C] font-medium">
              {summary.alert.message}
            </p>
          </div>
        </div>
      </UiCard>

      <UiCard className="flex flex-col justify-center py-5">
        <p className="text-[11px] font-black tracking-widest uppercase text-gray-400 mb-2">Hectáreas activas</p>
        <strong className="text-[28px] lg:text-[32px] font-black text-gray-900 tracking-tight leading-none">
          {formatCompactNumber(summary.stats.activeHectares)}
        </strong>
        <p className="text-[13px] font-medium text-gray-400 mt-2">
          {summary.stats.parcelCount} parcelas
        </p>
      </UiCard>

      <UiCard className="flex flex-col justify-center py-5 relative">
        <p className="text-[11px] font-black tracking-widest uppercase text-gray-400 mb-2">Ingresos proyectados</p>
        <strong className={`text-[28px] lg:text-[32px] font-black tracking-tight leading-none ${summary.stats.activeHectares === 0 ? "text-gray-300" : "text-gray-900"}`}>
          {summary.stats.activeHectares === 0 ? "S/0" : formatMoneyCompact(summary.stats.projectedIncomePen)}
        </strong>
        <p className="text-[13px] font-medium text-gray-400 mt-2">
          {summary.stats.activeHectares === 0 ? "Añade tu primera campaña" : "campaña actual"}
        </p>
        {summary.stats.activeHectares > 0 && (
          <div className="absolute right-5 bottom-5">
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-emerald-600">
              <ArrowUp size={16} strokeWidth={3} /> {formatSignedPercent(summary.stats.projectedIncomeDeltaPct)}
            </span>
          </div>
        )}
      </UiCard>

      <UiCard className="flex flex-col justify-center py-5">
        <p className="text-[11px] font-black tracking-widest uppercase text-gray-400 mb-2">Riesgo de portafolio</p>
        <strong className={`text-[28px] lg:text-[32px] font-black tracking-tight leading-none ${summary.stats.activeHectares === 0 ? "text-gray-300" : "text-[#E8751A]"}`}>
          {summary.stats.activeHectares === 0 ? "---" : summary.stats.portfolioRiskTitle}
        </strong>
        <p className="text-[13px] font-medium text-gray-400 mt-2">
          {summary.stats.activeHectares === 0 ? "Registra parcelas para evaluar" : `${summary.stats.activeAlertCount} de ${summary.stats.parcelCount} en alerta`}
        </p>
      </UiCard>
    </div>
  );
}
