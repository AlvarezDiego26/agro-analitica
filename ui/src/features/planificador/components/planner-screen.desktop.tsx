"use client";

import { useState } from "react";
import { AlertCircle, Search, Calendar, ChevronDown, Plus, Sprout, Sparkles, CheckSquare, ArrowDown, Calculator } from "lucide-react";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { toast } from "sonner";
import type { PlannerAnalysis } from "../types";

export function DesktopPlannerScreen({ analysis }: Readonly<{ analysis: PlannerAnalysis }>) {
  const [marketType, setMarketType] = useState<"local" | "exportacion" | "industrial">("exportacion");
  return (
    <DashboardShell 
      title="Planificador Inteligente" 
      subtitle="Análisis de campaña · Asistido por IA" 
      activeTab="planificar" 
      showHeaderActions
      bodyClassName="flex flex-col gap-5 pb-6"
    >
      <div className="flex flex-row items-start gap-6 h-full">
        
        {/* Left Column (Sidebar Form) */}
        <div className="w-[320px] shrink-0 flex flex-col gap-4 sticky top-6">
          <div>
            <p className="text-[11px] font-black tracking-widest uppercase text-emerald-600 mb-1">PASO 1</p>
            <h2 className="text-[18px] font-bold text-gray-900 leading-tight mb-4">Parámetros de campaña</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">VALLE</p>
              <div className="flex gap-1.5 p-1 bg-white border border-gray-200 rounded-lg w-full shadow-sm">
                <button className="flex-1 py-2 rounded-md text-gray-500 font-bold hover:text-gray-700 transition-colors text-[12px]" type="button">Ica</button>
                <button className="flex-1 py-2 rounded-md bg-gray-100 text-gray-900 font-bold shadow-sm text-[12px]" type="button">Pisco</button>
                <button className="flex-1 py-2 rounded-md text-gray-500 font-bold hover:text-gray-700 transition-colors text-[12px]" type="button">Chincha</button>
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">CULTIVO</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={16} strokeWidth={2.5} />
                </span>
                <input 
                  defaultValue="Espárrago verde" 
                  className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 py-2.5 text-[13px] font-semibold text-gray-800 shadow-sm focus:outline-none cursor-pointer" 
                  readOnly
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <ChevronDown size={16} strokeWidth={2.5} />
                </span>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">HECTÁREAS</span>
                <input 
                  defaultValue="4.0" 
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-gray-800 shadow-sm focus:outline-none" 
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">FECHA SIEMBRA</span>
                <div className="relative flex items-center justify-between w-full rounded-lg border border-gray-200 bg-white px-3 py-[7px] cursor-pointer shadow-sm">
                  <div className="flex items-center text-[12px] font-semibold text-gray-800 gap-2">
                    <Calendar size={14} strokeWidth={2.5} className="text-gray-400" />
                    15 Abr 2026
                  </div>
                  <ChevronDown size={14} strokeWidth={2.5} className="text-gray-400" />
                </div>
              </label>
            </div>
            
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-2">TIPO DE MERCADO</p>
              <div className="flex gap-1.5 p-1 bg-white border border-gray-200 rounded-lg w-full shadow-sm">
                <button 
                  onClick={() => setMarketType("local")}
                  className={`flex-1 py-2 rounded-md font-bold transition-all text-[11px] ${marketType === "local" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`} 
                  type="button"
                >
                  Local
                </button>
                <button 
                  onClick={() => setMarketType("exportacion")}
                  className={`flex-1 py-2 rounded-md font-bold transition-all text-[11px] ${marketType === "exportacion" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`} 
                  type="button"
                >
                  Exportación
                </button>
                <button 
                  onClick={() => setMarketType("industrial")}
                  className={`flex-1 py-2 rounded-md font-bold transition-all text-[11px] ${marketType === "industrial" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`} 
                  type="button"
                >
                  Industrial
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-0.5">VARIABLES A CONSIDERAR</p>
              
              {[
                "Precios históricos (3 años)",
                "Intenciones de siembra (SISAP)",
                "Predicción ML",
                "Datos climáticos"
              ].map(item => (
                <label key={item} className="flex items-center gap-2 cursor-pointer">
                  <span className="text-emerald-600 bg-emerald-50 rounded flex items-center justify-center p-0.5">
                    <CheckSquare size={16} strokeWidth={2.5} />
                  </span>
                  <span className="text-[13px] font-medium text-gray-700">{item}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="w-4 h-4 rounded border border-gray-300 bg-white flex items-center justify-center">
                </span>
                <span className="text-[13px] font-medium text-gray-400">Costos de insumos</span>
              </label>
            </div>

            <button 
              onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
                loading: 'Calculando proyecciones con IA...',
                success: 'Análisis de campaña completado con éxito.',
                error: 'Error al realizar el análisis.',
              })} 
              className="w-full mt-4 rounded-xl bg-[#208843] px-4 py-3 text-[14px] font-bold text-white shadow-sm hover:bg-[#156E3F] transition-colors flex items-center justify-center gap-2" 
              type="button"
            >
              <Sparkles size={16} strokeWidth={2.5} />
              Analizar campaña
            </button>
          </div>
        </div>

        {/* Right Column (Results) */}
        <div className="flex-1 flex flex-col gap-4 border-l border-gray-200 pl-6 min-w-0">
          
          {/* Main Alert Card */}
          <div className="bg-[#FCEAE8] border border-red-100 rounded-2xl flex items-center justify-between p-5 relative overflow-hidden">
            <div className="flex gap-4 items-center relative z-10">
              <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full border-[3px] border-red-600 bg-white shadow-sm">
                <AlertCircle size={24} strokeWidth={2.5} className="text-red-600" />
              </span>
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-red-600 mb-0.5">
                  RESULTADO DEL ANÁLISIS
                </p>
                <h2 className="text-[22px] leading-tight font-black text-[#D32F2F]">
                  Riesgo ALTO — no recomendado
                </h2>
                <p className="text-[12px] font-medium text-red-500 mt-1">
                  Espárrago verde · Pisco · 4.0 ha · Siembra 15 Abr 2026
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-center bg-white/60 p-3 rounded-xl border border-white relative z-10">
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">ROI ESTIMADO</p>
                <strong className="text-[20px] font-black text-[#D32F2F] tracking-tight">-12%</strong>
              </div>
              <div className="w-px h-10 bg-red-200/50"></div>
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">PRECIO PROMEDIO</p>
                <strong className="text-[20px] font-black text-[#D32F2F] tracking-tight">S/ 2.80</strong>
                <p className="text-[10px] font-semibold text-gray-500 mt-0.5">-22% vs histórico</p>
              </div>
              <div className="w-px h-10 bg-red-200/50"></div>
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">PÉRDIDA PROY.</p>
                <strong className="text-[20px] font-black text-[#D32F2F] tracking-tight">S/ -8,400</strong>
              </div>
            </div>
          </div>

          {/* AI Explanation Strip */}
          <div className="flex gap-3 items-center bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded bg-[#1B2533] text-white">
              <Sparkles size={14} strokeWidth={2.5} />
            </span>
            <p className="text-[13px] font-medium text-gray-700">
              <strong className="font-bold text-gray-900">Explicación de la IA —</strong> SISAP reporta <strong className="font-bold text-gray-900">+38% de intenciones de siembra</strong> de espárrago en Pisco para marzo-abril. El modelo proyecta caída sostenida de precio entre las semanas 14 y 22 por sobreoferta regional. Tu campaña coincide con el punto más bajo del ciclo.
            </p>
          </div>

          {/* Chart SVG */}
          <UiCard className="p-6 flex flex-col gap-6 shadow-sm border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 leading-tight">Proyección de precio - 12 meses</h3>
                <p className="text-[12px] font-medium text-gray-400 mt-0.5">Espárrago verde · Mercado mayorista Lima</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 border-b-[2px] border-dashed border-gray-400"></span>
                  <span className="text-[11px] font-medium text-gray-500">Histórico (3 años)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 border-b-2 border-solid border-emerald-600"></span>
                  <span className="text-[11px] font-medium text-gray-500">Predicción IA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-[#FCEAE8] border border-red-100"></span>
                  <span className="text-[11px] font-medium text-gray-500">Zona de sobreoferta</span>
                </div>
              </div>
            </div>
            
            <div className="w-full h-[280px] relative">
              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[13px] text-gray-400 font-medium">
                <span>S/ 4.0</span>
                <span>S/ 3.4</span>
                <span>S/ 2.8</span>
                <span>S/ 2.2</span>
                <span>S/ 1.6</span>
              </div>

              {/* Grid lines & Chart Area */}
              <div className="absolute left-14 right-0 top-2 bottom-6 border-b border-gray-200">
                <div className="w-full h-1/4 border-t border-gray-100"></div>
                <div className="w-full h-1/4 border-t border-gray-100"></div>
                <div className="w-full h-1/4 border-t border-gray-100"></div>
                <div className="w-full h-1/4 border-t border-gray-100"></div>
                
                {/* Red Area (Sobreoferta) */}
                <div className="absolute left-[30%] right-[40%] top-0 bottom-0 bg-[#FCEAE8]/60 border-l border-r border-dashed border-red-300 flex flex-col items-center">
                  <span className="text-[12px] font-black text-red-600 uppercase mt-4">Sobreoferta Proyectada</span>
                </div>

                {/* SVG Lines */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Historical dotted line */}
                  <polyline points="0,20 10,25 20,40 30,50 40,55 50,50 60,40 70,30 80,25 90,22 100,20" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
                  
                  {/* Prediction solid line */}
                  <polyline points="0,15 10,22 20,35 30,55 40,75 50,90 60,85 70,60 80,45 90,30 100,25" fill="none" stroke="#16A34A" strokeWidth="2.5" />
                  
                  {/* Points for prediction */}
                  <circle cx="0" cy="15" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  <circle cx="10" cy="22" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  <circle cx="20" cy="35" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  <circle cx="30" cy="55" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  <circle cx="40" cy="75" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  
                  {/* Low point (Red) */}
                  <circle cx="50" cy="90" r="4" fill="#D32F2F" />
                  
                  <circle cx="60" cy="85" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  <circle cx="70" cy="60" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  <circle cx="80" cy="45" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  <circle cx="90" cy="30" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                  <circle cx="100" cy="25" r="2.5" fill="white" stroke="#16A34A" strokeWidth="2" />
                </svg>

                {/* S/ 2.00 Label */}
                <div className="absolute left-[50%] top-[70%] -translate-x-1/2 flex flex-col items-center">
                  <div className="bg-[#D32F2F] text-white text-[14px] font-black px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    S/ 2.00 <ArrowDown size={14} strokeWidth={3} />
                  </div>
                  <div className="w-0.5 h-6 bg-[#D32F2F] border-l border-dashed border-red-800"></div>
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="absolute left-14 right-0 bottom-0 h-6 flex justify-between items-end text-[13px] text-gray-500 font-medium px-4">
                <span>Mar</span>
                <span>Abr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Ago</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dic</span>
                <span>Ene</span>
                <span>Feb</span>
              </div>
            </div>
          </UiCard>

          {/* Alternatives */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3 mt-4">
              <div>
                <h3 className="text-[15px] font-bold tracking-tight text-gray-900">Alternativas recomendadas</h3>
                <p className="text-[12px] font-medium text-gray-500">Cultivos con mejor ROI proyectado para tu valle y ventana</p>
              </div>
              <a href="#" className="text-[12px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                Ver todas &gt;
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <UiCard className="p-4 hover:border-emerald-200 transition-colors shadow-sm flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded bg-emerald-50 text-emerald-600">
                      <Sprout size={14} strokeWidth={2.5} />
                    </span>
                    <span className="text-[12px] font-black text-emerald-600">ROI +34%</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight">Palta Hass</h4>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">Demanda exportación EE.UU. en alza</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Riesgo bajo
                  </span>
                  <strong className="text-[14px] font-black text-gray-900">S/ 7.80<span className="text-[10px] font-bold text-gray-400">/kg</span></strong>
                </div>
              </UiCard>

              <UiCard className="p-4 hover:border-emerald-200 transition-colors shadow-sm flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded bg-emerald-50 text-emerald-600">
                      <Sprout size={14} strokeWidth={2.5} />
                    </span>
                    <span className="text-[12px] font-black text-emerald-600">ROI +18%</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight">Uva Red Globe</h4>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">Ventana de cosecha sin saturación</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Riesgo bajo
                  </span>
                  <strong className="text-[14px] font-black text-gray-900">S/ 6.10<span className="text-[10px] font-bold text-gray-400">/kg</span></strong>
                </div>
              </UiCard>

              <UiCard className="p-4 hover:border-amber-200 transition-colors shadow-sm flex flex-col justify-between h-36">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded bg-emerald-50 text-emerald-600">
                      <Sprout size={14} strokeWidth={2.5} />
                    </span>
                    <span className="text-[12px] font-black text-emerald-600">ROI +9%</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-gray-900 leading-tight">Cebolla amarilla</h4>
                  <p className="text-[11px] font-medium text-gray-500 mt-0.5">Precio estable, ciclo más corto</p>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Riesgo medio
                  </span>
                  <strong className="text-[14px] font-black text-gray-900">S/ 1.25<span className="text-[10px] font-bold text-gray-400">/kg</span></strong>
                </div>
              </UiCard>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
            <button onClick={() => toast.success('Proyección guardada con éxito.')} className="flex-1 py-3.5 rounded-xl bg-[#1B2533] text-white font-bold text-[13px] shadow-sm hover:bg-gray-800 transition-colors" type="button">
              Guardar proyección
            </button>
            <button 
              onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                loading: 'Generando reporte...',
                success: 'Reporte PDF/CSV exportado y descargado.',
                error: 'Error al generar el reporte.',
              })} 
              className="flex-1 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors shadow-sm" 
              type="button"
            >
              Exportar reporte
            </button>
            <button 
              onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                loading: 'Iniciando campaña...',
                success: 'Campaña iniciada con éxito. Redirigiendo...',
                error: 'Error al iniciar campaña.',
              })} 
              className="flex-1 py-3.5 rounded-xl bg-[#208843] text-white font-bold text-[13px] shadow-sm hover:bg-[#156E3F] transition-colors" 
              type="button"
            >
              Iniciar campaña
            </button>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
