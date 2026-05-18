"use client";

import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { useMarketplaceView } from "../hooks/use-marketplace-view";
import type { MarketOverview } from "../types";
import { toast } from "sonner";
import { Truck, ShoppingCart, ListFilter, BadgeCheck } from "lucide-react";

export function DesktopMarketplaceScreen({ market: _market }: Readonly<{ market: MarketOverview }>) {
  const { activeTab, setActiveTab } = useMarketplaceView();
  
  // Datos hardcodeados temporalmente para coincidir exactamente con el diseño UI
  const buyers = [
    {
      initials: "AP",
      name: "AgroExport Perú SAC",
      verified: true,
      type: "Exportación - EE.UU.",
      product: "Palta Hass",
      volume: "15 ton",
      date: "Cosecha mayo 2026",
      price: "8.20",
      match: 96,
      matchColor: "bg-[#208843]",
      textColor: "text-[#208843]"
    },
    {
      initials: "C",
      name: "Camposol",
      verified: true,
      type: "Calidad premium",
      product: "Espárrago verde",
      volume: "8 ton",
      date: "Entrega abril",
      price: "3.90",
      match: 88,
      matchColor: "bg-[#208843]",
      textColor: "text-[#208843]"
    },
    {
      initials: "Fd",
      name: "Frutícola del Sur",
      verified: false,
      type: "Mercado local",
      product: "Uva Red Globe",
      volume: "20 ton",
      date: "Cosecha junio",
      price: "6.50",
      match: 74,
      matchColor: "bg-[#D97706]",
      textColor: "text-[#D97706]"
    },
    {
      initials: "Bd",
      name: "Beta del Pacífico",
      verified: true,
      type: "Exportación - China",
      product: "Arándano",
      volume: "2 ton",
      date: "Cosecha agosto",
      price: "18.40",
      match: 42,
      matchColor: "bg-[#DC2626]",
      textColor: "text-[#DC2626]"
    },
    {
      initials: "PI",
      name: "Procesadora Ica",
      verified: true,
      type: "Industrial",
      product: "Cebolla amarilla",
      volume: "40 ton",
      date: "Continuo",
      price: "1.40",
      match: 68,
      matchColor: "bg-[#D97706]",
      textColor: "text-[#D97706]"
    }
  ];

  return (
    <DashboardShell 
      title="Mercado" 
      subtitle="Demanda e insumos · Ica y valles" 
      activeTab="mercado" 
      showHeaderActions
      bodyClassName="flex flex-col gap-6 pb-8"
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Top Controls Row */}
        <div className="flex justify-between items-center w-full">
          {/* Toggle Pestañas */}
          <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm w-[450px]">
            <button 
              className={`flex-1 py-2 px-3 flex justify-center items-center gap-2 rounded-lg font-bold transition-all text-[13px] ${activeTab === "demanda" ? "bg-[#1B2533] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`} 
              onClick={() => setActiveTab("demanda")} 
              type="button"
            >
              <Truck size={16} strokeWidth={2.5} />
              Demanda de compradores
            </button>
            <button 
              className={`flex-1 py-2 px-3 flex justify-center items-center gap-2 rounded-lg font-bold transition-all text-[13px] ${activeTab === "insumos" ? "bg-[#1B2533] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`} 
              onClick={() => setActiveTab("insumos")} 
              type="button"
            >
              <ShoppingCart size={16} strokeWidth={2.5} />
              Insumos y suministros
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4">
            <p className="text-[13px] font-medium text-gray-400">
              <strong className="font-bold text-gray-900">4 compradores</strong> · Ica y valles
            </p>
            <button type="button" onClick={() => toast.info('Opciones de filtrado avanzado...')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <ListFilter size={16} strokeWidth={2.5} className="text-gray-400" />
              Filtros
            </button>
          </div>
        </div>

        {/* Table Area */}
        {activeTab === "demanda" ? (
          <UiCard className="p-0 shadow-sm border-gray-200 overflow-hidden w-full">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-white">
                    <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[30%]">COMPRADOR</th>
                    <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[20%]">CULTIVO</th>
                    <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[20%]">CANTIDAD / ENTREGA</th>
                    <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[15%]">PRECIO OFRECIDO</th>
                    <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[15%]">MATCH IA</th>
                    <th className="py-4 px-6 w-[120px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {buyers.map((buyer) => (
                    <tr key={buyer.name} className="hover:bg-gray-50/50 transition-colors group">
                      
                      {/* Comprador */}
                      <td className="py-5 px-6">
                        <div className="flex gap-4 items-center">
                          <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#1B2533] text-white font-bold text-[14px] shadow-sm">
                            {buyer.initials}
                          </span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-emerald-800 transition-colors">{buyer.name}</h3>
                              {buyer.verified && <BadgeCheck size={14} strokeWidth={2.5} className="text-[#208843]" />}
                            </div>
                            <p className="text-[11px] font-medium text-gray-400 mt-0.5">{buyer.type}</p>
                          </div>
                        </div>
                      </td>

                      {/* Cultivo */}
                      <td className="py-5 px-6">
                        <span className="text-[13px] font-bold text-gray-700">{buyer.product}</span>
                      </td>

                      {/* Cantidad / Entrega */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-gray-900">{buyer.volume}</span>
                          <span className="text-[11px] font-medium text-gray-400 mt-0.5">{buyer.date}</span>
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="py-5 px-6">
                        <div className="flex items-baseline text-[#208843]">
                          <strong className="text-[16px] font-black tracking-tight leading-none">
                            S/ {buyer.price}
                          </strong>
                          <span className="text-[11px] font-bold ml-0.5">/kg</span>
                        </div>
                      </td>

                      {/* Match IA */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full rounded-full ${buyer.matchColor}`} style={{ width: `${buyer.match}%` }}></div>
                          </div>
                          <span className={`text-[12px] font-black ${buyer.textColor}`}>{buyer.match}%</span>
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="py-5 px-6 text-right">
                        <button type="button" 
                          onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                            loading: `Enviando postulación a ${buyer.name}...`,
                            success: 'Postulación enviada correctamente.',
                            error: 'Error al enviar la postulación.',
                          })} 
                          className="px-5 py-2 rounded-lg bg-[#208843] text-white font-bold text-[12px] shadow-sm hover:bg-[#156E3F] transition-colors"
                        >
                          Postular
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </UiCard>
        ) : (
          <UiCard className="p-10 text-center flex flex-col items-center justify-center border-dashed border-2 border-gray-200 shadow-sm w-full">
            <ShoppingCart size={40} strokeWidth={1.5} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Sección de insumos</h3>
            <p className="text-gray-500 mt-1">Próximamente disponible en la plataforma web.</p>
          </UiCard>
        )}
      </div>
    </DashboardShell>
  );
}
