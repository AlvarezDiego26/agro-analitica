"use client";

import { useState } from "react";
import { AlertCircle, ArrowLeft, MoreVertical, Plus, ChevronDown, Sparkles, CheckSquare, Calculator, Search, Calendar, Sprout } from "lucide-react";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { toast } from "sonner";
import type { PlannerAnalysis } from "../types";

export function MobilePlannerScreen({ analysis }: Readonly<{ analysis: PlannerAnalysis }>) {
  const [valle, setValle] = useState<"ica" | "pisco" | "chincha">("ica");
  const [marketType, setMarketType] = useState<"local" | "exportacion" | "industrial">("exportacion");
  // Datos hardcodeados temporalmente para coincidir exacto con el diseño
  const result = analysis.result;

  return (
    <DashboardShell 
      title="Planificador" 
      subtitle="Decisiones basadas en datos" 
      activeTab="planificar" 
      bodyClassName="flex flex-col gap-5 pb-32"
    >
      {/* Tarjeta de Formulario */}
      <UiCard className="flex flex-col shadow-sm border-gray-200 p-5">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-gray-500 mb-2">Valle</p>
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-2xl w-full">
              <button 
                onClick={() => setValle("ica")}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${valle === "ica" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`} 
                type="button"
              >
                Ica
              </button>
              <button 
                onClick={() => setValle("pisco")}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${valle === "pisco" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`} 
                type="button"
              >
                Pisco
              </button>
              <button 
                onClick={() => setValle("chincha")}
                className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${valle === "chincha" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`} 
                type="button"
              >
                Chincha
              </button>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 mt-1">
            <span className="text-[11px] font-black tracking-widest uppercase text-gray-500">Cultivo</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} strokeWidth={2.5} />
              </span>
              <input 
                defaultValue="Espárrago verde" 
                className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-10 py-3.5 text-[15px] font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer" 
                readOnly
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} strokeWidth={2.5} />
              </span>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3 mt-1">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black tracking-widest uppercase text-gray-500">Hectáreas</span>
              <input 
                defaultValue="4.0" 
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-black tracking-widest uppercase text-gray-500">Fecha siembra</span>
              <div className="relative flex items-center justify-between w-full rounded-2xl border border-gray-200 bg-white px-3 py-[9px] cursor-pointer">
                <div className="flex items-center">
                  <Calendar size={18} strokeWidth={2.5} className="text-gray-400 mr-2" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[13px] font-semibold text-gray-800">15 Abr</span>
                    <span className="text-[12px] font-medium text-gray-500">2026</span>
                  </div>
                </div>
                <ChevronDown size={18} strokeWidth={2.5} className="text-gray-400" />
              </div>
            </label>
          </div>

          <button 
            type="button" 
            onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
              loading: 'Calculando proyecciones con IA...',
              success: 'Análisis de campaña completado con éxito.',
              error: 'Error al realizar el análisis.',
            })} 
            className="w-full mt-2 rounded-2xl bg-[#208843] px-5 py-4 text-[16px] font-bold text-white shadow-sm hover:bg-[#156E3F] transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} strokeWidth={3} className="text-white" />
              Analizar campaña
            </span>
          </button>
        </div>
      </UiCard>

      <div className="flex items-center justify-between gap-3 mt-2">
        <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Resultados del análisis</h3>
      </div>

      {/* Resultados Box */}
      <UiCard className="bg-[#FCEAE8] border-transparent p-0 overflow-hidden">
        <div className="p-5 flex gap-4 items-center relative">
          {/* Custom Alert Circle matching design */}
          <span className="shrink-0 w-[50px] h-[50px] flex items-center justify-center rounded-full bg-transparent border-[3px] border-red-600 text-red-600 shadow-sm relative">
            {/* The visual gap in the circle from screenshot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FCEAE8] rotate-45"></span>
            <AlertCircle size={28} strokeWidth={2.5} className="text-red-600" />
          </span>
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-red-700">
              Nivel de riesgo
            </p>
            <h2 className="mt-0.5 mb-0.5 text-[22px] leading-tight font-black text-[#D32F2F]">
              ALTO
            </h2>
            <p className="text-[13px] font-medium text-red-500">
              No recomendado en esta ventana
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 pt-4 pb-5 px-5 bg-white border-t border-gray-100">
          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-gray-500 mb-1">
              ROI estimado
            </p>
            <strong className="text-[24px] font-black text-[#D32F2F] tracking-tight">-12%</strong>
          </div>
          <div className="pl-5 border-l border-gray-100">
            <p className="text-[11px] font-black tracking-widest uppercase text-gray-500 mb-1">
              Precio prom.
            </p>
            <strong className="text-[24px] font-black text-[#D32F2F] tracking-tight">S/ 2.80</strong>
            <p className="text-[12px] font-semibold text-gray-400 mt-0.5">
              -22% vs hist.
            </p>
          </div>
        </div>

        <div className="flex gap-3 items-start bg-white p-5 border-t border-gray-100">
          <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-[#1B2533] text-white mt-0.5">
            <Plus size={16} strokeWidth={3} />
          </span>
          <p className="text-[13px] leading-relaxed font-medium text-gray-700">
            <strong className="font-bold text-gray-900">Por qué:</strong> SISAP reporta <strong className="font-bold text-gray-900">+38% de intenciones de siembra</strong> de espárrago en Pisco para marzo-abril. La curva de precios proyecta caída entre semana 14-22.
          </p>
        </div>
      </UiCard>

      {/* Gráfico SVG Simulado */}
      <UiCard className="p-5 flex flex-col gap-4 shadow-sm border-gray-200 mt-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[16px] font-bold text-gray-900 leading-tight">Proyección de precio</h3>
            <p className="text-[12px] font-medium text-gray-400 mt-0.5">Espárrago verde · Pisco · 4.0 ha</p>
          </div>
          <span className="text-[11px] font-medium text-gray-400">S/ por kg</span>
        </div>
        
        <div className="w-full h-44 mt-4 relative">
          {/* Y Axis Labels */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-400 font-medium">
            <span>4.0</span>
            <span>3.4</span>
            <span>2.8</span>
            <span>2.2</span>
            <span>1.6</span>
          </div>

          {/* Grid lines & Chart Area */}
          <div className="absolute left-7 right-0 top-1 bottom-6 border-b border-gray-200">
            <div className="w-full h-1/4 border-t border-gray-100"></div>
            <div className="w-full h-1/4 border-t border-gray-100"></div>
            <div className="w-full h-1/4 border-t border-gray-100"></div>
            <div className="w-full h-1/4 border-t border-gray-100"></div>
            
            {/* Red Area (Sobreoferta) */}
            <div className="absolute left-[30%] right-[40%] top-0 bottom-0 bg-[#FCEAE8] flex flex-col items-center">
              <span className="text-[9px] font-black text-red-500 uppercase mt-2">Sobreoferta</span>
            </div>

            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Historical dotted line */}
              <polyline points="0,20 20,40 40,55 60,40 80,25 100,20" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
              
              {/* Prediction solid line */}
              <polyline points="0,15 20,35 40,75 50,90 60,85 80,45 100,25" fill="none" stroke="#16A34A" strokeWidth="2.5" />
              
              {/* Points for prediction */}
              <circle cx="0" cy="15" r="2.5" fill="white" stroke="#16A34A" strokeWidth="1.5" />
              <circle cx="20" cy="35" r="2.5" fill="white" stroke="#16A34A" strokeWidth="1.5" />
              <circle cx="40" cy="75" r="2.5" fill="white" stroke="#16A34A" strokeWidth="1.5" />
              
              {/* Low point (Red) */}
              <circle cx="50" cy="90" r="3" fill="#D32F2F" />
              
              <circle cx="60" cy="85" r="2.5" fill="white" stroke="#16A34A" strokeWidth="1.5" />
              <circle cx="80" cy="45" r="2.5" fill="white" stroke="#16A34A" strokeWidth="1.5" />
              <circle cx="100" cy="25" r="2.5" fill="white" stroke="#16A34A" strokeWidth="1.5" />
            </svg>

            {/* S/ 2.00 Label */}
            <div className="absolute left-[50%] top-[74%] -translate-x-1/2 bg-[#D32F2F] text-white text-[10px] font-black px-1.5 py-0.5 rounded">
              S/ 2.00
            </div>
          </div>

          {/* X Axis Labels */}
          <div className="absolute left-7 right-0 bottom-0 h-6 flex justify-between items-end text-[10px] text-gray-400 font-medium px-2">
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
            <span>Ene</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 border-b-[2px] border-dashed border-gray-400"></span>
            <span className="text-[12px] font-medium text-gray-600">Histórico (3 años)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 border-b-2 border-solid border-emerald-600"></span>
            <span className="text-[12px] font-medium text-gray-600">Predicción IA</span>
          </div>
          <div className="flex items-center gap-1.5 w-full mt-1">
            <span className="w-3 h-2 bg-[#FCEAE8]"></span>
            <span className="text-[12px] font-medium text-gray-600">Riesgo sobreoferta</span>
          </div>
        </div>
      </UiCard>

      <div className="flex items-center justify-between gap-3 mt-4">
        <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Alternativas recomendadas</h3>
      </div>

      <div className="flex flex-col gap-3">
        {/* Alt 1 */}
        <UiCard className="p-4 hover:border-emerald-200 transition-colors shadow-sm">
          <div className="flex gap-4 items-center">
            <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sprout size={20} strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-[16px] font-bold text-gray-900">Palta Hass</h4>
                <span className="text-[13px] font-black text-emerald-600">ROI +34%</span>
              </div>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5">Demanda exportación EE.UU. en alza</p>
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-50/80 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Riesgo bajo
                </span>
              </div>
            </div>
          </div>
        </UiCard>

        {/* Alt 2 */}
        <UiCard className="p-4 hover:border-emerald-200 transition-colors shadow-sm">
          <div className="flex gap-4 items-center">
            <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sprout size={20} strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-[16px] font-bold text-gray-900">Uva Red Globe</h4>
                <span className="text-[13px] font-black text-emerald-600">ROI +18%</span>
              </div>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5">Ventana de cosecha sin saturación</p>
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-50/80 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Riesgo bajo
                </span>
              </div>
            </div>
          </div>
        </UiCard>

        {/* Alt 3 */}
        <UiCard className="p-4 hover:border-amber-200 transition-colors shadow-sm">
          <div className="flex gap-4 items-center">
            <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sprout size={20} strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-[16px] font-bold text-gray-900">Cebolla amarilla</h4>
                <span className="text-[13px] font-black text-emerald-600">ROI +9%</span>
              </div>
              <p className="text-[13px] font-medium text-gray-500 mt-0.5">Precio estable, ciclo más corto</p>
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-amber-50/80 text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Riesgo medio
                </span>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-[max(env(safe-area-inset-bottom),64px)] left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 md:hidden flex gap-3 z-40">
        <button 
          type="button" 
          onClick={() => toast.success('Plan guardado con éxito.')} 
          className="flex-[1.2] py-4 rounded-xl bg-[#1B2533] text-white font-bold text-[15px] shadow-sm hover:bg-gray-800 transition-colors"
        >
          Guardar plan
        </button>
        <button 
          type="button" 
          onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            loading: 'Generando alternativas...',
            success: 'Alternativas cargadas con éxito.',
            error: 'Error al cargar alternativas.',
          })} 
          className="flex-1 py-4 rounded-xl bg-white border border-gray-200 text-[#1B2533] font-bold text-[15px] hover:bg-gray-50 transition-colors shadow-sm"
        >
          Ver alternativas
        </button>
      </div>
    </DashboardShell>
  );
}
