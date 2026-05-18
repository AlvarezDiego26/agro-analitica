"use client";

import { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, ArrowRight, Sparkles, Sun, Cloud, CloudRain } from "lucide-react";
import type { DashboardOverviewResponse } from "../types";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";

export function DesktopHomeScreen({ dashboard: _dashboard }: Readonly<{ dashboard: DashboardOverviewResponse }>) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "3m" | "1a">("30d");
  const featuredProducts = [
    {
      name: "Espárrago verde",
      code: "UC-157 · 8.5 ha",
      risk: "Riesgo Medio",
      riskType: "amber",
      stage: "CRECIMIENTO",
      daysToHarvest: "48D A COSECHA",
      sowingProgress: 60,
      sowingColor: "bg-[#E8751A]",
      projectedPrice: "3.40",
      delta: "4.2%",
      deltaType: "down"
    },
    {
      name: "Uva Red Globe",
      code: "Floración · 4 ha",
      risk: "Riesgo Bajo",
      riskType: "emerald",
      stage: "FLORACIÓN",
      daysToHarvest: "120D A COSECHA",
      sowingProgress: 30,
      sowingColor: "bg-emerald-500",
      projectedPrice: "6.10",
      delta: "2.8%",
      deltaType: "up"
    },
    {
      name: "Palta Hass",
      code: "Pre-cosecha · 2.2 ha",
      risk: "Riesgo Bajo",
      riskType: "emerald",
      stage: "PRE-COSECHA",
      daysToHarvest: "18D A COSECHA",
      sowingProgress: 90,
      sowingColor: "bg-emerald-500",
      projectedPrice: "7.80",
      delta: "5.1%",
      deltaType: "up"
    }
  ];

  return (
    <DashboardShell
      title="Inicio"
      subtitle="Panel general · 16 Mar 2026"
      activeTab="inicio"
      showHeaderActions
      bodyClassName="flex flex-col gap-5 xl:gap-6 pb-6"
    >
      {/* ROW 1: TOP STATS (Desktop: 4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5">
        {/* Alerta Regional */}
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
                Riesgo ALTO de sobreoferta de Espárrago en Pisco — marzo
              </h2>
              <p className="text-[11px] leading-relaxed text-[#B91C1C] font-medium">
                +38% de intenciones de siembra vs. campaña anterior · SISAP
              </p>
            </div>
          </div>
        </UiCard>

        {/* Hectareas Activas */}
        <UiCard className="flex flex-col justify-center py-5">
          <p className="text-[11px] font-black tracking-widest uppercase text-gray-400 mb-2">Hectáreas activas</p>
          <strong className="text-[28px] lg:text-[32px] font-black text-gray-900 tracking-tight leading-none">
            14.7
          </strong>
          <p className="text-[13px] font-medium text-gray-400 mt-2">
            3 parcelas
          </p>
        </UiCard>

        {/* Ingresos Proyectados */}
        <UiCard className="flex flex-col justify-center py-5 relative">
          <p className="text-[11px] font-black tracking-widest uppercase text-gray-400 mb-2">Ingresos proyectados</p>
          <strong className="text-[28px] lg:text-[32px] font-black text-gray-900 tracking-tight leading-none">
            S/ 182k
          </strong>
          <p className="text-[13px] font-medium text-gray-400 mt-2">
            campaña actual
          </p>
          <div className="absolute right-5 bottom-5">
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-emerald-600">
              <ArrowUp size={16} strokeWidth={3} /> 6.4%
            </span>
          </div>
        </UiCard>

        {/* Riesgo de Portafolio */}
        <UiCard className="flex flex-col justify-center py-5">
          <p className="text-[11px] font-black tracking-widest uppercase text-gray-400 mb-2">Riesgo de portafolio</p>
          <strong className="text-[28px] lg:text-[32px] font-black text-[#E8751A] tracking-tight leading-none">
            Medio
          </strong>
          <p className="text-[13px] font-medium text-gray-400 mt-2">
            1 de 3 en alerta
          </p>
        </UiCard>
      </div>

      {/* ROW 2: CAMPAÑAS Y RECOMENDACIÓN (Desktop: 3/4 + 1/4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-5">
        
        {/* Campañas Activas (Span 3 on Desktop) */}
        <section className="col-span-1 xl:col-span-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-1 mt-1">
            <div>
              <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Mis campañas activas</h3>
              <p className="text-[13px] font-medium text-gray-400">3 cultivos · 14.7 ha</p>
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
                      <p className="text-[12px] text-gray-400 mt-1 font-medium">{product.code}</p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                        product.riskType === "amber" ? "bg-amber-50/80 text-amber-700" : "bg-emerald-50/80 text-emerald-700"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${product.riskType === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                      {product.risk}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>{product.stage}</span>
                      <span>{product.daysToHarvest}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <span className={`block h-full rounded-full ${product.sowingColor}`} style={{ width: `${product.sowingProgress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-6 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-0.5">
                      PRECIO PROYECTADO
                    </p>
                    <strong className="text-[22px] font-black text-gray-900 tracking-tight">
                      S/ {product.projectedPrice}<span className="text-[13px] font-bold text-gray-400">/kg</span>
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

        {/* Recomendación IA (Span 1 on Desktop) */}
        <UiCard className="col-span-1 flex flex-col justify-between shadow-xl overflow-hidden relative bg-[#13614B] border-transparent p-6 mt-1">
          <div className="relative z-10 h-full flex flex-col">
            <p className="text-[10px] font-black tracking-widest uppercase text-emerald-300 flex items-center gap-1.5 mb-4">
              <Sparkles size={12} strokeWidth={2.5} />
              AGROANALÍTICA - IA
            </p>
            <p className="text-[10px] font-black tracking-widest uppercase text-emerald-100 mb-1">
              RECOMENDACIÓN DEL DÍA
            </p>
            <h3 className="text-[17px] leading-snug font-bold mb-4 text-white">
              Considera sembrar <span className="font-black underline decoration-2 underline-offset-4 decoration-emerald-400">Palta Hass</span> en lugar de Espárrago este abril.
            </h3>
            
            <div className="flex gap-4 mb-4">
              <div>
                 <p className="text-[9px] font-black tracking-widest uppercase text-emerald-200 mb-1">ROI PROYECTADO</p>
                 <strong className="text-[20px] font-black text-white">+34%</strong>
              </div>
              <div>
                 <p className="text-[9px] font-black tracking-widest uppercase text-emerald-200 mb-1">RIESGO</p>
                 <strong className="text-[20px] font-black text-white">Bajo</strong>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed text-emerald-50 font-medium opacity-90 mb-6">
              Hay sobreoferta proyectada de espárrago en tu valle. La palta muestra demanda creciente de exportación a EE.UU.
            </p>

            <div className="mt-auto">
              <a href={views.planner} className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-[#13614B] font-bold shadow-sm">
                Abrir Planificador &gt;
              </a>
            </div>
          </div>
        </UiCard>
      </div>

      {/* ROW 3: GRÁFICOS Y WIDGETS (Desktop: 2/4 + 1/4 + 1/4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-5">
        
        {/* Precios Mercado Lima (Span 2) */}
        <section className="col-span-1 xl:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-1 mt-1">
            <div>
              <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Precios mercado Lima</h3>
              <p className="text-[13px] font-medium text-gray-400">Cierre 16 mar · S/ por kg</p>
            </div>
            <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button 
                onClick={() => setTimeRange("7d")}
                className={`px-2 py-1 text-[11px] font-bold rounded transition-all ${timeRange === "7d" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                7d
              </button>
              <button 
                onClick={() => setTimeRange("30d")}
                className={`px-2 py-1 text-[11px] font-bold rounded transition-all ${timeRange === "30d" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                30d
              </button>
              <button 
                onClick={() => setTimeRange("3m")}
                className={`px-2 py-1 text-[11px] font-bold rounded transition-all ${timeRange === "3m" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                3m
              </button>
              <button 
                onClick={() => setTimeRange("1a")}
                className={`px-2 py-1 text-[11px] font-bold rounded transition-all ${timeRange === "1a" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                1a
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
            {[
              { name: "Uva", price: "6.10", delta: "2.8%", type: "up" },
              { name: "Espárrago", price: "3.40", delta: "4.2%", type: "down" },
              { name: "Palta", price: "7.80", delta: "5.1%", type: "up" },
              { name: "Cebolla", price: "1.25", delta: "1.4%", type: "down" }
            ].map((item, idx) => (
              <UiCard key={item.name} className="flex flex-col p-4 justify-between min-h-[120px] shadow-sm border-gray-200 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                  <span className="text-[14px] font-bold text-gray-700">{item.name}</span>
                  <span className={`inline-flex items-center gap-0.5 text-[12px] font-bold ${item.type === "up" ? "text-emerald-600" : "text-red-500"}`}>
                    {item.type === "up" ? <ArrowUp size={14} strokeWidth={3} /> : <ArrowDown size={14} strokeWidth={3} />}
                    {item.delta}
                  </span>
                </div>
                <div className="mt-auto z-10 relative">
                  <strong className="text-[22px] font-black text-gray-900 tracking-tight">
                    S/ {item.price}<span className="text-[12px] font-bold text-gray-400">/kg</span>
                  </strong>
                </div>
                {/* Mini chart SVG simulation */}
                <div className="absolute right-0 bottom-0 left-8 h-1/2 pointer-events-none opacity-40">
                  <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
                    {item.type === "up" ? (
                      <>
                        <path d="M0 45 L30 35 L60 25 L100 15 L100 50 L0 50 Z" fill="#D1FAE5" opacity="0.5"/>
                        <path d="M0 45 L30 35 L60 25 L100 15" fill="none" stroke="#10B981" strokeWidth="2"/>
                      </>
                    ) : (
                      <>
                        <path d="M0 15 L30 25 L60 35 L100 45 L100 50 L0 50 Z" fill="#FEE2E2" opacity="0.5"/>
                        <path d="M0 15 L30 25 L60 35 L100 45" fill="none" stroke="#EF4444" strokeWidth="2"/>
                      </>
                    )}
                  </svg>
                </div>
              </UiCard>
            ))}
          </div>
        </section>

        {/* Tareas Próximas (Span 1) */}
        <section className="col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-1 mt-1">
             <div>
              <h3 className="text-[16px] font-bold tracking-tight text-gray-900">Tareas próximas</h3>
              <p className="text-[12px] font-medium text-gray-400">Esta semana · 5 pendientes</p>
            </div>
          </div>
          
          <UiCard className="p-5 shadow-sm border-gray-200 h-full flex flex-col">
             <ul className="flex flex-col gap-4 flex-1">
                <li className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-tight">Aplicar fertilizante NPK</h4>
                    <p className="text-[11px] font-medium text-gray-500">Hoy · Parcela Norte</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-tight">Inspección plagas</h4>
                    <p className="text-[11px] font-medium text-gray-500">Mar 18 · Parcela Sur</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-tight">Riego programado</h4>
                    <p className="text-[11px] font-medium text-gray-500">Mar 20 · Parcela Oeste</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-tight">Cosecha Palta Hass</h4>
                    <p className="text-[11px] font-medium text-gray-500">Mar 22 · Parcela Oeste</p>
                  </div>
                </li>
             </ul>
             <a href="#" className="text-[13px] font-bold text-[#208843] hover:text-[#156E3F] transition-colors mt-4">
              Ver calendario &gt;
            </a>
          </UiCard>
        </section>

        {/* Rightmost column (Span 1): Compradores & Clima */}
        <section className="col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 px-1 mt-1">
             <div>
              <h3 className="text-[16px] font-bold tracking-tight text-gray-900">Compradores activos</h3>
              <p className="text-[12px] font-medium text-gray-400">4 ofertas compatibles con tus cultivos</p>
            </div>
            <a href={views.market} className="text-[13px] font-bold text-[#208843] hover:text-[#156E3F] transition-colors">
              Ver &gt;
            </a>
          </div>

          <UiCard className="p-4 shadow-sm border-gray-200 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#1B2533] text-white font-bold text-[12px]">AP</span>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-none">AgroExport Perú <span className="text-[#208843]">●</span></h4>
                    <p className="text-[11px] font-medium text-gray-500">Palta Hass · 15 ton</p>
                  </div>
                </div>
                <strong className="text-[13px] font-black text-[#208843]">S/ 8.20<span className="text-[10px] text-gray-400 font-bold">/kg</span></strong>
             </div>
             
             <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-3 items-center">
                  <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#1B2533] text-white font-bold text-[12px]">C</span>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-none">Camposol <span className="text-[#208843]">●</span></h4>
                    <p className="text-[11px] font-medium text-gray-500">Espárrago · 8 ton</p>
                  </div>
                </div>
                <strong className="text-[13px] font-black text-[#208843]">S/ 3.90<span className="text-[10px] text-gray-400 font-bold">/kg</span></strong>
             </div>
             
             <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-3 items-center">
                  <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#1B2533] text-white font-bold text-[12px]">Fd</span>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-none">Frutícola del Sur</h4>
                    <p className="text-[11px] font-medium text-gray-500">Uva · 20 ton</p>
                  </div>
                </div>
                <strong className="text-[13px] font-black text-[#208843]">S/ 6.50<span className="text-[10px] text-gray-400 font-bold">/kg</span></strong>
             </div>
          </UiCard>

          {/* Clima */}
          <div className="flex items-center justify-between gap-3 px-1 mt-2">
             <div>
              <h3 className="text-[16px] font-bold tracking-tight text-gray-900">Clima - Ica</h3>
              <p className="text-[12px] font-medium text-gray-400">Próximos 5 días</p>
            </div>
          </div>
          <UiCard className="p-4 shadow-sm border-gray-200">
            <div className="flex justify-between items-center text-center">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium text-gray-400 mb-2">Lun</span>
                <Sun size={20} strokeWidth={2} className="text-amber-500 mb-1" />
                <span className="text-[13px] font-bold text-gray-900">24°</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium text-gray-400 mb-2">Mar</span>
                <Sun size={20} strokeWidth={2} className="text-amber-500 mb-1" />
                <span className="text-[13px] font-bold text-gray-900">25°</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium text-gray-400 mb-2">Mié</span>
                <Cloud size={20} strokeWidth={2} className="text-gray-400 mb-1" />
                <span className="text-[13px] font-bold text-gray-900">22°</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium text-gray-400 mb-2">Jue</span>
                <CloudRain size={20} strokeWidth={2} className="text-blue-500 mb-1" />
                <span className="text-[13px] font-bold text-gray-900">21°</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-medium text-gray-400 mb-2">Vie</span>
                <Sun size={20} strokeWidth={2} className="text-amber-500 mb-1" />
                <span className="text-[13px] font-bold text-gray-900">23°</span>
              </div>
            </div>
          </UiCard>

        </section>

      </div>

    </DashboardShell>
  );
}
