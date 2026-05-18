import { AlertTriangle, ArrowDown, ArrowUp, ArrowRight, Sparkles } from "lucide-react";
import type { DashboardOverviewResponse } from "../types";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";

export function MobileHomeScreen({ dashboard: _dashboard }: Readonly<{ dashboard: DashboardOverviewResponse }>) {
  const featuredProducts = [
    {
      name: "Espárrago verde",
      code: "UC-157",
      hectares: "8.5 ha",
      risk: "Riesgo medio",
      riskType: "amber",
      sowingProgress: 62,
      sowingColor: "bg-[#E8751A]",
      projectedPrice: "3.40",
      delta: "4.2 %",
      deltaType: "down"
    },
    {
      name: "Uva Red Globe",
      code: "Floración",
      hectares: "4 ha",
      risk: "Mercado activo",
      riskType: "emerald",
      sowingProgress: 34,
      sowingColor: "bg-emerald-500",
      projectedPrice: "6.10",
      delta: "",
      deltaType: "none"
    }
  ];

  return (
    <DashboardShell
      title="Hola, Manuel"
      subtitle="Lun, 16 Mar · Ica"
      activeTab="inicio"
      showHeaderActions
      bodyClassName="flex flex-col gap-5 pb-6"
    >
      {/* Alerta Regional */}
      <UiCard tone="alert">
        <div className="flex gap-4 items-start">
          <span className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-red-600 text-white shadow-sm ring-4 ring-red-50 mt-1">
            <AlertTriangle size={20} strokeWidth={2.5} />
          </span>
          <div className="pt-1">
            <p className="text-[11px] font-black tracking-widest uppercase text-red-600 mb-1">
              ALERTA REGIONAL
            </p>
            <h2 className="text-[16px] leading-tight font-bold text-red-900 mb-2 pr-2">
              Riesgo ALTO de sobreoferta de Espárrago en Pisco para marzo
            </h2>
            <p className="text-[13px] leading-relaxed text-red-700 font-medium">
              +38% de intenciones de siembra vs. campaña anterior
            </p>
          </div>
        </div>
      </UiCard>

      {/* Campañas Activas */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 px-1 mt-1">
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Mis campañas activas</h3>
          <a href={views.planner} className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Ver todas
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 h-full">
          {featuredProducts.map((product) => (
            <UiCard key={product.name} className="flex flex-col justify-between hover:border-emerald-200 transition-colors cursor-pointer group p-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col xl:flex-row justify-between gap-2 items-start">
                  <div>
                    <h4 className="text-[16px] leading-tight font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">{product.name}</h4>
                    <p className="text-[12px] text-gray-500 mt-1 font-medium">
                      {product.code} <span className="opacity-50">·</span> {product.hectares}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
                      product.riskType === "amber" ? "bg-amber-50/80 text-amber-700" : "bg-emerald-50/80 text-emerald-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${product.riskType === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                    {product.risk}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mt-5">
                  <div className="flex justify-between text-[11px] text-gray-400 font-bold px-0.5">
                    <span>Siembra</span>
                    <span className={`transition-colors ${product.riskType === "amber" ? "text-[#E8751A]" : "text-emerald-500"}`}>{product.sowingProgress}%</span>
                    <span>Cosecha</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <span className={`block h-full rounded-full ${product.sowingColor}`} style={{ width: `${product.sowingProgress}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mt-5 pt-4 border-t border-gray-100/80">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-0.5">
                    PROYECCIÓN
                  </p>
                  <strong className="text-[18px] font-black text-gray-900 tracking-tight">
                    S/ {product.projectedPrice}<span className="text-[12px] font-bold text-gray-500">/kg</span>
                  </strong>
                </div>
                {product.deltaType !== "none" && (
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold text-[12px] ${
                      product.deltaType === "down" ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {product.deltaType === "down" ? <ArrowDown size={14} strokeWidth={3} /> : <ArrowUp size={14} strokeWidth={3} />}
                    {product.delta}
                  </span>
                )}
              </div>
            </UiCard>
          ))}
        </div>
      </section>

      {/* Recomendación */}
      <UiCard tone="success" className="flex flex-col justify-between shadow-emerald-900/10 shadow-xl overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[11px] font-black tracking-widest uppercase text-emerald-100/90 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-white/10">
              <Sparkles size={13} strokeWidth={2.5} className="text-white" />
            </span>
            AGROANALÍTICA RECOMIENDA
          </p>
          <h3 className="text-[18px] leading-snug font-bold mt-4 mb-3 text-white">
            Considera sembrar <span className="underline decoration-2 underline-offset-4">Palta Hass</span> en lugar de Espárrago este abril. Proyección: +34% ROI.
          </h3>
          <p className="text-[13px] leading-relaxed text-emerald-50 font-medium opacity-90">
            Hay sobreoferta proyectada de espárrago en tu valle. La palta muestra demanda creciente de exportación a EE.UU.
          </p>
        </div>
        <a href={views.planner} className="inline-flex items-center justify-center gap-2 mt-6 py-3 px-4 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-50 transition-colors shadow-sm self-start">
          Abrir Planificador
          <ArrowRight size={16} strokeWidth={2.5} />
        </a>
      </UiCard>

      {/* Precios Hoy */}
      <section className="flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between gap-3 px-1 mt-2">
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Precios hoy — Mercado Lima</h3>
          <button type="button" className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Uva", price: "6.10", delta: "2.8 %", type: "up" },
            { name: "Espárrago", price: "3.40", delta: "4.2 %", type: "down" },
            { name: "Palta", price: "7.80", delta: "5.1 %", type: "up" },
            { name: "Cebolla", price: "1.25", delta: "1.4 %", type: "down" }
          ].map(item => (
            <UiCard key={item.name} className="flex flex-col p-4 justify-between h-28 hover:border-emerald-200 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[14px] font-bold text-gray-700">{item.name}</span>
                <span className={`inline-flex items-center gap-0.5 text-[12px] font-bold ${item.type === "up" ? "text-emerald-600" : "text-red-500"}`}>
                  {item.type === "up" ? <ArrowUp size={14} strokeWidth={3} /> : <ArrowDown size={14} strokeWidth={3} />}
                  {item.delta}
                </span>
              </div>
              <div className="mt-auto">
                <strong className="text-[20px] font-black text-gray-900 tracking-tight">
                  S/ {item.price}
                </strong>
                <span className="text-[13px] font-bold text-gray-400">/kg</span>
              </div>
            </UiCard>
          ))}
        </div>
      </section>

    </DashboardShell>
  );
}
