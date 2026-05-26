"use client";

import { Sparkles } from "lucide-react";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { formatCurrency, formatMoney, formatSignedPercent, usePlanificador } from "../hooks/use-planificador";

export function MobilePlannerScreen() {
  const {
    mounted,
    form,
    result,
    alternatives,
    updateForm,
    isSubmitting,
    handleAnalyzeCampaign
  } = usePlanificador();

  if (!mounted) {
    return (
      <DashboardShell
        title="Planificador"
        subtitle="Decisiones basadas en datos"
        activeTab="planificar"
        bodyClassName="flex flex-col gap-5 pb-28"
      >
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600"></div>
        </div>
      </DashboardShell>
    );
  }

  const marketOptions = [
    ["local", "Local"],
    ["exportacion", "Exportacion"],
    ["industrial", "Industrial"]
  ] as const;

  return (
    <DashboardShell
      title="Planificador"
      subtitle="Decisiones basadas en datos"
      activeTab="planificar"
      bodyClassName="flex flex-col gap-5 pb-28"
    >
      <UiCard className="p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-gray-500">Valle</p>
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-gray-100 p-1">
              {["Ica", "Pisco", "Chincha"].map((valle) => (
                <button
                  key={valle}
                  type="button"
                  onClick={() => updateForm("valle", valle)}
                  className={`rounded-xl py-2.5 text-[13px] font-bold transition-all ${
                    form.valle === valle ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  {valle}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Cultivo</span>
            <select
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-800"
              value={form.producto}
              onChange={(event) => updateForm("producto", event.target.value)}
            >
              <option value="">Selecciona un cultivo</option>
              <option value="Espárrago verde">Espárrago verde</option>
              <option value="Palta Hass">Palta Hass</option>
              <option value="Uva Red Globe">Uva Red Globe</option>
              <option value="Cebolla amarilla">Cebolla amarilla</option>
              <option value="Lúcuma">Lúcuma</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Hectáreas</span>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-800"
                value={form.hectareas}
                onChange={(event) => updateForm("hectareas", event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Fecha siembra</span>
              <input
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-800"
                type="date"
                value={form.fechaSiembra}
                onChange={(event) => updateForm("fechaSiembra", event.target.value)}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">Tu inversion (S/) - Opcional</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[15px]">
                S/
              </span>
              <input
                type="number"
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-[15px] font-semibold text-gray-800"
                placeholder="Ej. 50000"
                value={form.inversionPen}
                onChange={(event) => updateForm("inversionPen", event.target.value)}
              />
            </div>
          </label>

          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-gray-500">Tipo de mercado</p>
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-gray-100 p-1">
              {marketOptions.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateForm("tipoMercado", value as any)}
                  className={`rounded-xl py-2.5 text-[12px] font-bold transition-all ${
                    form.tipoMercado === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyzeCampaign}
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#208843] px-5 py-4 text-[16px] font-bold text-white shadow-sm disabled:opacity-70"
          >
            <Sparkles size={16} strokeWidth={3} />
            {isSubmitting ? "Analizando..." : "Analizar campaña"}
          </button>
        </div>
      </UiCard>

      {result ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Resultados del análisis</h3>
          </div>

          <UiCard className={`${result.riskLevel === "high" ? "bg-[#FCEAE8]" : result.riskLevel === "medium" ? "bg-[#FFF8E1]" : "bg-[#EBF5EE]"} overflow-hidden border-transparent p-0`}>
            <div className="p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Nivel de riesgo</p>
              <h2 className="mt-1 text-[22px] font-black leading-tight text-[#D32F2F]">{result.title}</h2>
              <p className="text-[13px] font-medium text-red-500">{result.summary}</p>
            </div>

            <div className="grid grid-cols-2 border-t border-gray-100 bg-white px-5 py-4">
              <div>
                <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-gray-500">ROI estimado</p>
                <strong className="text-[24px] font-black text-[#D32F2F]">{formatSignedPercent(result.estimatedRoi)}</strong>
              </div>
              <div className="border-l border-gray-100 pl-5">
                <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-gray-500">Precio prom.</p>
                <strong className="text-[24px] font-black text-[#D32F2F]">{formatCurrency(result.averagePrice)}</strong>
                <p className="mt-0.5 text-[12px] font-semibold text-gray-400">
                  {typeof result.historicalDeltaPct === "number" ? `${result.historicalDeltaPct}% vs hist.` : "Sin dato"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 bg-white p-5">
              <p className="text-[13px] leading-relaxed font-medium text-gray-700">
                <strong className="text-gray-900">Por qué:</strong> {result.aiExplanation ?? result.explanation}
              </p>
              {result.projectedLossPen ? (
                <p className="mt-2 text-[12px] font-bold text-red-500">Pérdida proyectada: {formatMoney(result.projectedLossPen)}</p>
              ) : null}
            </div>
          </UiCard>

          {alternatives.length > 0 ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Alternativas recomendadas</h3>
              </div>

              <div className="flex flex-col gap-3">
                {alternatives.map((item) => (
                  <UiCard key={item.producto} className="p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-[16px] font-bold text-gray-900">{item.producto}</h4>
                        <p className="mt-0.5 text-[13px] font-medium text-gray-500">{item.message}</p>
                        <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          {item.riskLabel}
                        </span>
                      </div>
                      <span className="text-[13px] font-black text-emerald-600">ROI {formatSignedPercent(item.estimatedRoi)}</span>
                    </div>
                  </UiCard>
                ))}
              </div>
            </>
          ) : null}
        </>
      ) : null}
    </DashboardShell>
  );
}
