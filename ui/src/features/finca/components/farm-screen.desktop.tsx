"use client";

import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { Map, BadgeCheck, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function DesktopFarmScreen() {
  const parcels = [
    {
      name: "Parcela Norte",
      crop: "Espárrago verde · Crecimiento",
      size: "8.5",
      risk: "Riesgo Medio",
      riskType: "amber",
      progress: 62,
    },
    {
      name: "Parcela Sur",
      crop: "Uva Red Globe · Floración",
      size: "4",
      risk: "Riesgo Bajo",
      riskType: "emerald",
      progress: 34,
    },
    {
      name: "Parcela Oeste",
      crop: "Palta Hass · Pre-cosecha",
      size: "2.2",
      risk: "Riesgo Bajo",
      riskType: "emerald",
      progress: 88,
    }
  ];

  const history = [
    { year: "2025", crop: "Espárrago verde", parcel: "Norte", yield: "12.4 t/ha", price: "S/ 3.85", income: "S/ 41,200", roi: "+18%", roiType: "positive" },
    { year: "2024", crop: "Cebolla amarilla", parcel: "Norte", yield: "38 t/ha", price: "S/ 1.40", income: "S/ 18,090", roi: "-8%", roiType: "negative" },
    { year: "2024", crop: "Uva Red Globe", parcel: "Sur", yield: "18 t/ha", price: "S/ 5.90", income: "S/ 42,480", roi: "+22%", roiType: "positive" },
    { year: "2023", crop: "Espárrago verde", parcel: "Norte", yield: "10.8 t/ha", price: "S/ 3.20", income: "S/ 20,376", roi: "+4%", roiType: "positive" },
    { year: "2023", crop: "Palta Hass", parcel: "Oeste", yield: "9.2 t/ha", price: "S/ 7.10", income: "S/ 14,375", roi: "+28%", roiType: "positive" },
  ];

  const certifications = [
    { name: "Global G.A.P.", date: "Vence Nov 2026", color: "bg-[#208843]" },
    { name: "SENASA - Buenas Prácticas", date: "Vence Feb 2027", color: "bg-[#208843]" },
    { name: "Comercio Justo", date: "Vence May 2026", color: "bg-amber-500" },
  ];

  return (
    <DashboardShell 
      title="Mi Finca" 
      subtitle="Fundo San Juan · 14.7 ha" 
      activeTab="mi-finca" 
      showHeaderActions
      bodyClassName="flex flex-col gap-6 pb-8"
    >
      <div className="flex flex-row items-start gap-6 h-full w-full">
        
        {/* Left Column (Main Data - 75%) */}
        <div className="flex-[3] flex flex-col gap-6 min-w-0">
          
          {/* Top KPIs Card */}
          <UiCard className="p-0 shadow-sm border-gray-200">
            <div className="flex items-center text-left divide-x divide-gray-100 py-6">
              <div className="flex flex-col flex-1 px-8">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1.5">
                  HECTÁREAS TOTALES
                </span>
                <strong className="text-[26px] font-black text-gray-900 tracking-tight leading-none">14.7</strong>
              </div>
              <div className="flex flex-col flex-1 px-8">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1.5">
                  PARCELAS
                </span>
                <strong className="text-[26px] font-black text-gray-900 tracking-tight leading-none">3</strong>
              </div>
              <div className="flex flex-col flex-1 px-8">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1.5">
                  CAMPAÑAS ACTIVAS
                </span>
                <strong className="text-[26px] font-black text-gray-900 tracking-tight leading-none">3</strong>
              </div>
              <div className="flex flex-col flex-1 px-8">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1.5">
                  ROI PROMEDIO 2025
                </span>
                <strong className="text-[26px] font-black text-[#208843] tracking-tight leading-none">+18%</strong>
              </div>
              <div className="flex flex-col flex-1 px-8">
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1.5">
                  CERTIFICACIONES
                </span>
                <strong className="text-[26px] font-black text-gray-900 tracking-tight leading-none">
                  2 <span className="text-[12px] font-bold text-gray-400 ml-1">Global G.A.P. · SENASA</span>
                </strong>
              </div>
            </div>
          </UiCard>

          {/* Parcelas Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold tracking-tight text-gray-900">Parcelas</h3>
                <p className="text-[12px] font-medium text-gray-500 mt-0.5">3 parcelas · Fundo San Juan, Ica</p>
              </div>
              <button type="button" onClick={() => toast.info('Cargando visualizador satelital...')} className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                <Map size={14} strokeWidth={2.5} />
                Ver mapa
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {parcels.map((parcel) => (
                <UiCard key={parcel.name} onClick={() => toast.success(`Cargando detalles de ${parcel.name}...`)} className="flex flex-col gap-4 p-5 shadow-sm border-gray-200 hover:border-emerald-200 transition-colors cursor-pointer group">
                  <div className="flex gap-4 items-center">
                    <div className="shrink-0 w-12 h-12 flex flex-col items-center justify-center rounded-full bg-[#F0FDF4] text-[#208843] shadow-inner">
                      <span className="text-[16px] font-black tracking-tight leading-none">{parcel.size}</span>
                      <span className="text-[8px] font-black uppercase tracking-wider opacity-70 mt-0.5">HECTÁREAS</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-bold text-gray-900 truncate group-hover:text-emerald-800 transition-colors">{parcel.name}</h4>
                      <p className="text-[12px] font-medium text-gray-500 mt-0.5 truncate">{parcel.crop}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex justify-between items-center text-[9px] font-black tracking-widest uppercase text-gray-400">
                      <span>AVANCE</span>
                      <span>{parcel.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${parcel.riskType === "amber" ? "bg-[#E8751A]" : "bg-[#208843]"}`} style={{ width: `${parcel.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      parcel.riskType === "amber" ? "bg-amber-50/80 text-amber-700" : "bg-emerald-50/80 text-emerald-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${parcel.riskType === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                      {parcel.risk}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-emerald-600 transition-colors flex items-center">
                      Detalle <ChevronRight size={14} strokeWidth={2.5} />
                    </span>
                  </div>
                </UiCard>
              ))}
            </div>
          </div>

          {/* Historial Section */}
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold tracking-tight text-gray-900">Historial de campañas</h3>
                <p className="text-[12px] font-medium text-gray-500 mt-0.5">5 campañas registradas · 2023-2025</p>
              </div>
              <button type="button" 
                onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                  loading: 'Generando reporte CSV...',
                  success: 'CSV exportado y descargado con éxito.',
                  error: 'Error al exportar CSV.',
                })} 
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Exportar CSV
              </button>
            </div>

            <UiCard className="p-0 shadow-sm border-gray-200 overflow-hidden">
              <div className="w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-white">
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400">AÑO</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400">CULTIVO</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400">PARCELA</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 text-center">RENDIMIENTO</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 text-right">PRECIO</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 text-right">INGRESO</th>
                      <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 text-right">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {history.map((row, idx) => (
                      <tr key={`${row.year}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 px-6 text-[13px] font-bold text-gray-500">{row.year}</td>
                        <td className="py-5 px-6 text-[14px] font-bold text-gray-900">{row.crop}</td>
                        <td className="py-5 px-6 text-[13px] font-medium text-gray-600">{row.parcel}</td>
                        <td className="py-5 px-6 text-[13px] font-medium text-gray-500 text-center">{row.yield}</td>
                        <td className="py-5 px-6 text-[14px] font-medium text-gray-600 text-right">{row.price}</td>
                        <td className="py-5 px-6 text-[14px] font-bold text-gray-900 text-right">{row.income}</td>
                        <td className={`py-5 px-6 text-[14px] font-black tracking-tight text-right ${
                          row.roiType === "positive" ? "text-[#208843]" : "text-[#D32F2F]"
                        }`}>
                          {row.roi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </UiCard>
          </div>
        </div>

        {/* Right Column (Sidebar - 25%) */}
        <div className="flex-[1] flex flex-col gap-6 min-w-[280px]">
          
          <UiCard className="p-6 shadow-sm border-gray-200">
            <h3 className="text-[15px] font-bold tracking-tight text-gray-900 leading-tight">Resumen del productor</h3>
            <p className="text-[12px] font-medium text-gray-500 mt-0.5 mb-6">Fundo San Juan · Ica</p>
            
            <div className="flex gap-4 items-center mb-6">
              <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#1B2533] text-white font-bold text-[16px] shadow-sm">
                MQ
              </span>
              <div className="flex flex-col">
                <h4 className="text-[15px] font-bold text-gray-900 leading-tight">Manuel Quispe</h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <BadgeCheck size={14} strokeWidth={2.5} className="text-[#208843]" />
                  <p className="text-[12px] font-bold text-gray-500">Productor verificado</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-[12px] font-medium text-gray-500">Antigüedad</span>
                <span className="text-[13px] font-bold text-gray-900">4 años</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-[12px] font-medium text-gray-500">Campañas cerradas</span>
                <span className="text-[13px] font-bold text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-[12px] font-medium text-gray-500">ROI histórico</span>
                <span className="text-[13px] font-black text-gray-900">+14.8%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-[12px] font-medium text-gray-500">Calificación compradores</span>
                <span className="text-[13px] font-bold text-gray-900">4.8 / 5</span>
              </div>
            </div>
          </UiCard>

          <UiCard className="p-6 shadow-sm border-gray-200">
            <h3 className="text-[15px] font-bold tracking-tight text-gray-900 leading-tight">Certificaciones</h3>
            <p className="text-[12px] font-medium text-gray-500 mt-0.5 mb-5">Vigentes</p>
            
            <div className="flex flex-col gap-4">
              {certifications.map((cert) => (
                <div key={cert.name} className="flex items-start gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${cert.color}`}></span>
                  <div>
                    <h4 className="text-[13px] font-bold text-gray-900 leading-tight">{cert.name}</h4>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">{cert.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => toast.info('Abriendo formulario de nueva certificación...')} className="w-full mt-6 py-2.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-[12px] font-bold text-gray-600 hover:bg-gray-100 transition-colors flex justify-center items-center gap-1.5">
              <Plus size={14} strokeWidth={2.5} />
              Agregar certificación
            </button>
          </UiCard>
        </div>
      </div>
    </DashboardShell>
  );
}
