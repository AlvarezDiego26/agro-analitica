"use client";

import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { ChevronRight, Map } from "lucide-react";
import { toast } from "sonner";

export function MobileFarmScreen() {
  const parcels = [
    {
      name: "Parcela Norte",
      crop: "Espárrago verde · Crecimiento",
      size: "8.5",
      risk: "Riesgo medio",
      riskType: "amber"
    },
    {
      name: "Parcela Sur",
      crop: "Uva Red Globe · Floración",
      size: "4",
      risk: "Riesgo bajo",
      riskType: "emerald"
    },
    {
      name: "Parcela Oeste",
      crop: "Palta Hass · Pre-cosecha",
      size: "2.2",
      risk: "Riesgo bajo",
      riskType: "emerald"
    }
  ];

  const history = [
    { year: "2025", crop: "Espárrago", yield: "12.4 t/ha", price: "S/ 3.85", roi: "+18%", roiType: "positive" },
    { year: "2024", crop: "Cebolla", yield: "38 t/ha", price: "S/ 1.40", roi: "-6%", roiType: "negative" },
    { year: "2024", crop: "Uva", yield: "18 t/ha", price: "S/ 5.90", roi: "+22%", roiType: "positive" },
    { year: "2023", crop: "Espárrago", yield: "10.8 t/ha", price: "S/ 3.20", roi: "+4%", roiType: "positive" },
  ];

  return (
    <DashboardShell 
      title="Mi Finca" 
      subtitle="Fundo San Juan · Ica" 
      activeTab="mi-finca" 
      bodyClassName="flex flex-col gap-5 pb-24"
    >
      <div className="absolute top-6 right-6 md:right-8 z-10 hidden sm:block">
        <button type="button" onClick={() => toast.info('Cargando visualizador satelital...')} className="w-12 h-12 flex items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 transition-colors">
          <Map size={20} strokeWidth={2.5} />
        </button>
      </div>
      
      {/* Mobile Map Icon (if DashboardShell doesn't put it in header automatically) */}
      <div className="flex sm:hidden absolute top-5 right-4 z-10 mt-1">
        <button type="button" onClick={() => toast.info('Cargando visualizador satelital...')} className="w-10 h-10 flex items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 text-gray-700 transition-colors">
          <Map size={18} strokeWidth={2.5} />
        </button>
      </div>

      <UiCard className="flex flex-col shadow-sm border-gray-200 py-4 px-2">
        <div className="flex justify-between items-center text-center divide-x divide-gray-100">
          <div className="flex flex-col flex-1 px-1">
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">
              Hectáreas
            </span>
            <strong className="text-[20px] sm:text-[24px] font-black text-gray-900 tracking-tight">14.7</strong>
          </div>
          <div className="flex flex-col flex-1 px-1">
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">
              Parcelas
            </span>
            <strong className="text-[20px] sm:text-[24px] font-black text-gray-900 tracking-tight">3</strong>
          </div>
          <div className="flex flex-col flex-1 px-1">
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1 leading-tight">
              Campañas<br/>Activas
            </span>
            <strong className="text-[20px] sm:text-[24px] font-black text-gray-900 tracking-tight">3</strong>
          </div>
          <div className="flex flex-col flex-1 px-1">
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-gray-400 mb-1">
              ROI 2025
            </span>
            <strong className="text-[20px] sm:text-[24px] font-black text-[#208843] tracking-tight">+18%</strong>
          </div>
        </div>
      </UiCard>

      <div className="flex flex-col gap-3 mt-1">
        <div className="flex items-center justify-between gap-3 px-1">
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Parcelas</h3>
          <button type="button" onClick={() => toast.info('Cargando mapa...')} className="text-[13px] font-bold text-[#208843] hover:text-[#156E3F] transition-colors">
            Mapa
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {parcels.map((parcel) => (
            <UiCard key={parcel.name} onClick={() => toast.success(`Cargando detalles de ${parcel.name}...`)} className="flex gap-4 items-center p-4 shadow-sm border-gray-200 hover:border-emerald-200 transition-colors cursor-pointer">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#208843] shadow-inner">
                <div className="flex items-baseline">
                  <span className="text-[20px] font-black tracking-tight">{parcel.size}</span>
                  <span className="text-[11px] font-bold ml-0.5">ha</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[16px] font-bold text-gray-900 truncate">{parcel.name}</h4>
                <p className="text-[13px] font-medium text-gray-500 mt-0.5 truncate">{parcel.crop}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    parcel.riskType === "amber" ? "bg-amber-50/80 text-amber-700" : "bg-emerald-50/80 text-emerald-700"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${parcel.riskType === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                    {parcel.risk}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} strokeWidth={2} className="text-gray-300 ml-2 shrink-0" />
            </UiCard>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Historial de campañas</h3>
        </div>

        <UiCard className="p-0 shadow-sm border-gray-200 overflow-hidden">
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <thead>
                <tr>
                  <th className="py-4 px-4 text-[10px] font-black tracking-widest uppercase text-gray-400">Año</th>
                  <th className="py-4 px-4 text-[10px] font-black tracking-widest uppercase text-gray-400">Cultivo</th>
                  <th className="py-4 px-4 text-[10px] font-black tracking-widest uppercase text-gray-400 text-right">Rend.</th>
                  <th className="py-4 px-4 text-[10px] font-black tracking-widest uppercase text-gray-400 text-right">Precio</th>
                  <th className="py-4 px-4 text-[10px] font-black tracking-widest uppercase text-gray-400 text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {history.map((row, idx) => (
                  <tr key={`${row.year}-${row.crop}-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-[13px] font-semibold text-gray-600">{row.year}</td>
                    <td className="py-4 px-4 text-[14px] font-bold text-gray-900">{row.crop}</td>
                    <td className="py-4 px-4 text-[13px] font-medium text-gray-500 text-right whitespace-nowrap">{row.yield}</td>
                    <td className="py-4 px-4 text-[13px] font-medium text-gray-500 text-right whitespace-nowrap">{row.price}</td>
                    <td className={`py-4 px-4 text-[14px] font-black tracking-tight text-right ${
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

    </DashboardShell>
  );
}
