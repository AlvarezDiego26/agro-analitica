import { AlertCircle, CheckCircle, Sparkles, Sprout, TrendingUp } from "lucide-react";
import type { PlannerAnalysis } from "../types";
import { formatCurrency, formatMoney, formatProfit, formatShortDate, formatSignedPercent } from "../hooks/use-planificador";
import { MetricBlock } from "./planner-ui-helpers";

export type PlannerResultBannerProps = {
  analysis: PlannerAnalysis | null;
  result: PlannerAnalysis["result"] | null;
};

export function PlannerResultBanner({ analysis, result }: PlannerResultBannerProps) {
  if (!analysis || !result) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-[#EBF5EE] p-5">
        <div className="relative z-10 flex items-start gap-4">
          <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-emerald-600 bg-white shadow-sm">
            <Sprout size={24} strokeWidth={2.5} className="text-emerald-600" />
          </span>
          <div>
            <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-emerald-600">Planificacion inteligente</p>
            <h2 className="text-[20px] font-black leading-tight text-emerald-800">Esperando parametros</h2>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-emerald-700/90">
              Selecciona un cultivo o ingresa datos validos para ver recomendaciones basadas en analisis de IA.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis.input.producto) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-[#EBF5EE] p-5">
        <div className="relative z-10 flex items-start gap-4">
          <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-emerald-600 bg-white shadow-sm">
            <Sprout size={24} strokeWidth={2.5} className="text-emerald-600" />
          </span>
          <div>
            <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-emerald-600">Planificacion inteligente</p>
            <h2 className="text-[20px] font-black leading-tight text-emerald-800">Alternativas sugeridas para la region {analysis.input.valle}</h2>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-emerald-700/90">
              Aun no has seleccionado un cultivo. Basado en las proyecciones y el analisis historico de precios en la region{" "}
              <strong>{analysis.input.valle}</strong>, estas son las mejores opciones para esta ventana de siembra.
            </p>
            <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-emerald-600/90">
              Haz clic en cualquier tarjeta recomendada para analizarla de inmediato.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const risk = result.riskLevel;
  const isLow = risk === "low";
  const isMedium = risk === "medium";
  const bannerBg = isLow ? "bg-[#EBF5EE]" : isMedium ? "bg-[#FFF8E1]" : "bg-[#FCEAE8]";
  const bannerBorder = isLow ? "border-emerald-100" : isMedium ? "border-amber-200" : "border-red-100";
  const iconBorder = isLow ? "border-emerald-600" : isMedium ? "border-amber-500" : "border-red-600";
  const iconColor = isLow ? "text-emerald-600" : isMedium ? "text-amber-500" : "text-red-600";
  const labelColor = isLow ? "text-emerald-700" : isMedium ? "text-amber-600" : "text-red-600";
  const titleColor = isLow ? "text-emerald-900" : isMedium ? "text-amber-800" : "text-[#D32F2F]";
  const subColor = isLow ? "text-emerald-700" : isMedium ? "text-amber-600" : "text-red-500";
  const sepColor = isLow ? "bg-emerald-200/50" : isMedium ? "bg-amber-200/50" : "bg-red-200/50";
  const priceColor = isLow ? "text-emerald-800" : isMedium ? "text-amber-700" : "text-[#D32F2F]";
  const Icon = isLow ? CheckCircle : isMedium ? TrendingUp : AlertCircle;
  const roiTone = isLow ? "success" : isMedium ? "warning" : "danger";
  const hasProfit = result.estimatedRoi > 0;
  const showsProjectedMoney = result.usesUserInvestment && (result.projectedProfitPen !== null || result.projectedLossPen !== null);
  const windowSignalCopy =
    result.windowPriceSignal === "up"
      ? "La cosecha proyectada sale mejor que el precio de siembra."
      : result.windowPriceSignal === "same"
        ? "La cosecha proyectada sale muy cerca del precio de siembra."
        : "La cosecha proyectada cae frente al precio de siembra.";

  return (
    <>
      <div className={`${bannerBg} ${bannerBorder} relative overflow-hidden rounded-2xl border p-5`}>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] ${iconBorder} bg-white shadow-sm`}>
              <Icon size={24} strokeWidth={2.5} className={iconColor} />
            </span>
            <div>
              <p className={`mb-0.5 text-[9px] font-black uppercase tracking-widest ${labelColor}`}>Resultado del analisis</p>
              <h2 className={`text-[22px] font-black leading-tight ${titleColor}`}>Riesgo {result.title} - {result.summary.toLowerCase()}</h2>
              <p className={`mt-1 text-[12px] font-medium ${subColor}`}>
                {analysis.input.producto} - {analysis.input.valle} - {analysis.input.hectareas.toFixed(1)} ha - Siembra {formatShortDate(analysis.input.fechaSiembra)}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-6 rounded-xl border border-white bg-white/60 p-3">
            <MetricBlock label="ROI estimado" value={formatSignedPercent(result.estimatedRoi)} tone={roiTone} />
            <div className={`h-10 w-px ${sepColor}`}></div>
            <div>
              <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-gray-500">Precio promedio</p>
              <strong className={`text-[20px] font-black tracking-tight ${priceColor}`}>{formatCurrency(result.averagePrice)}</strong>
              <p className="mt-0.5 text-[10px] font-semibold text-gray-500">
                {typeof result.historicalDeltaPct === "number" ? `${result.historicalDeltaPct}% vs historico en tu ventana` : "promedio entre siembra y cosecha"}
              </p>
            </div>
            <div className={`h-10 w-px ${sepColor}`}></div>
            {showsProjectedMoney ? (
              hasProfit ? (
                <MetricBlock label="Ganancia proy." value={formatMoney(result.projectedProfitPen)} tone="success" />
              ) : (
                <MetricBlock label="Perdida proy." value={formatMoney(result.projectedLossPen)} tone="danger" />
              )
            ) : (
              <div>
                <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-gray-500">Proyeccion en S/</p>
                <strong className="text-[16px] font-black tracking-tight text-gray-700">Ingresa inversion</strong>
                <p className="mt-0.5 text-[10px] font-semibold text-gray-500">Para estimar ganancia o perdida real</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#1B2533] text-white">
          <Sparkles size={14} strokeWidth={2.5} />
        </span>
        <p className="text-[13px] font-medium text-gray-700">
          <strong className="font-bold text-gray-900">Explicacion de la IA:</strong> {result.aiExplanation ?? result.explanation}
        </p>
      </div>

      {result.sowingPrice !== null && result.sowingPrice !== undefined && result.harvestPrice !== null && result.harvestPrice !== undefined ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-[13px] text-gray-700 shadow-sm">
          <strong className="text-gray-900">Lectura de ventana:</strong>{" "}
          Siembra en <strong>S/ {result.sowingPrice.toFixed(2)}</strong> y cosecha proyectada en{" "}
          <strong>S/ {result.harvestPrice.toFixed(2)}</strong>. {windowSignalCopy}
        </div>
      ) : null}
    </>
  );
}
