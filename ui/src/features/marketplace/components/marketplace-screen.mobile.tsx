"use client";

import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { useMarketplaceView } from "../hooks/use-marketplace-view";
import type { MarketOverview } from "../types";
import { toast } from "sonner";
import { Truck, ShoppingCart, ListFilter, BadgeCheck } from "lucide-react";

export function MobileMarketplaceScreen({ market: _market }: Readonly<{ market: MarketOverview }>) {
  const { activeTab, setActiveTab } = useMarketplaceView();
  
  // Datos hardcodeados temporalmente para coincidir exactamente con el diseño UI
  const buyers = [
    {
      initials: "AP",
      name: "AgroExport Perú SAC",
      verified: true,
      type: "Exportación",
      product: "Palta Hass",
      volume: "15 ton",
      date: "Cosecha mayo 2026",
      price: "8.20"
    },
    {
      initials: "C",
      name: "Camposol",
      verified: true,
      type: "Cal. premium",
      product: "Espárrago verde",
      volume: "8 ton",
      date: "Entrega abril",
      price: "3.90"
    },
    {
      initials: "Fd",
      name: "Frutícola del Sur",
      verified: false,
      type: "Mercado local",
      product: "Uva Red Globe",
      volume: "20 ton",
      date: "Cosecha junio",
      price: "6.50"
    },
    {
      initials: "Bd",
      name: "Beta del Pacífico",
      verified: true,
      type: "Exportación",
      product: "Arándano",
      volume: "2 ton",
      date: "Cosecha agosto",
      price: "18.40"
    }
  ];

  return (
    <DashboardShell 
      title="Mercado" 
      subtitle="Conecta tu cosecha" 
      activeTab="mercado" 
      bodyClassName="flex flex-col gap-4 pb-24"
    >
      <div className="flex flex-col gap-5">
        {/* Toggle Pestañas */}
        <div className="flex p-1.5 bg-gray-50/80 rounded-2xl border border-gray-100 w-full shadow-inner">
          <button 
            className={`flex-1 py-3 px-2 flex justify-center items-center gap-2 rounded-xl font-bold transition-all text-[15px] ${activeTab === "demanda" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`} 
            onClick={() => setActiveTab("demanda")} 
            type="button"
          >
            <Truck size={18} strokeWidth={2.5} />
            Demanda
          </button>
          <button 
            className={`flex-1 py-3 px-2 flex justify-center items-center gap-2 rounded-xl font-bold transition-all text-[15px] ${activeTab === "insumos" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"}`} 
            onClick={() => setActiveTab("insumos")} 
            type="button"
          >
            <ShoppingCart size={18} strokeWidth={2.5} />
            Insumos
          </button>
        </div>

        {/* Filtros */}
        <div className="flex justify-between items-center px-1">
          <p className="text-[14px] text-gray-600">
            <strong className="font-bold text-gray-900">4 compradores</strong> activos en Ica
          </p>
          <button type="button" onClick={() => toast.info('Opciones de filtrado avanzado...')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <ListFilter size={16} strokeWidth={2.5} className="text-gray-400" />
            Filtrar
          </button>
        </div>
      </div>

      {activeTab === "demanda" ? (
        <div className="flex flex-col gap-4 mt-1">
          {buyers.map((buyer) => (
            <UiCard key={buyer.name} className="flex flex-col p-5 shadow-sm border-gray-200 hover:border-emerald-200 transition-colors">
              {/* Header Empresa */}
              <div className="flex gap-4 items-center">
                <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#1B2533] text-white font-bold text-[17px]">
                  {buyer.initials}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[16px] font-bold text-gray-900 leading-tight">{buyer.name}</h3>
                    {buyer.verified && <BadgeCheck size={16} strokeWidth={2.5} className="text-[#208843]" />}
                  </div>
                  <p className="text-[13px] font-medium text-gray-400 mt-0.5">{buyer.type}</p>
                </div>
              </div>

              {/* Separator */}
              <hr className="my-4 border-gray-100" />

              {/* Info Oferta */}
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h4 className="text-[16px] font-bold text-gray-900">{buyer.product}</h4>
                  <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                    {buyer.volume} <span className="opacity-50 mx-0.5">·</span> {buyer.date}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-0.5">
                    OFRECE
                  </span>
                  <div className="flex items-baseline text-[#208843]">
                    <strong className="text-[24px] font-black tracking-tight leading-none">
                      S/ {buyer.price}
                    </strong>
                    <span className="text-[13px] font-bold ml-0.5">/kg</span>
                  </div>
                </div>
              </div>

              {/* Botón */}
              <button type="button" 
                onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                  loading: `Enviando postulación a ${buyer.name}...`,
                  success: 'Postulación enviada correctamente.',
                  error: 'Error al enviar la postulación.',
                })} 
                className="w-full py-4 rounded-xl bg-[#208843] text-white font-bold text-[16px] shadow-sm hover:bg-[#156E3F] transition-colors"
              >
                Postular mi cosecha
              </button>
            </UiCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-1">
          <UiCard className="p-5 text-center flex flex-col items-center justify-center py-10 border-dashed border-2 border-gray-200 shadow-sm">
            <ShoppingCart size={40} strokeWidth={1.5} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">Sección de insumos</h3>
            <p className="text-gray-500 mt-1">Próximamente disponible.</p>
          </UiCard>
        </div>
      )}
    </DashboardShell>
  );
}
