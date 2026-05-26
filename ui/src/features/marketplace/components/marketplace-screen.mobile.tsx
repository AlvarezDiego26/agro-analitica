"use client";

import { BadgeCheck, BellRing, Eye, ListFilter, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { formatCurrency } from "../../dashboard/components/dashboard-helpers";
import { useAuth } from "../../../providers/auth-provider";
import { useMarketplaceView } from "../hooks/use-marketplace-view";
import type { MarketOverview } from "../types";

export function MobileMarketplaceScreen({ market: _market }: Readonly<{ market: MarketOverview }>) {
  const { isAuthenticated, requireAuth } = useAuth();
  const {
    activeTab,
    setActiveTab,
    filteredSupplyItems,
    supplyItems,
    selectedSupplyFilter,
    setSelectedSupplyFilter,
    supplyFilters
  } = useMarketplaceView();

  const buyers = [
    {
      initials: "AP",
      name: "AgroExport Peru SAC",
      verified: true,
      type: "Exportacion",
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
      product: "Esparrago verde",
      volume: "8 ton",
      date: "Entrega abril",
      price: "3.90"
    },
    {
      initials: "Fd",
      name: "Fruticola del Sur",
      verified: false,
      type: "Mercado local",
      product: "Uva Red Globe",
      volume: "20 ton",
      date: "Cosecha junio",
      price: "6.50"
    },
    {
      initials: "Bd",
      name: "Beta del Pacifico",
      verified: true,
      type: "Exportacion",
      product: "Arandano",
      volume: "2 ton",
      date: "Cosecha agosto",
      price: "18.40"
    }
  ];

  const headline =
    activeTab === "demanda"
      ? `${buyers.length} compradores activos en Ica`
      : `${supplyItems.length} referencias para comparar en insumos`;

  return (
    <DashboardShell title="Mercado" subtitle="Demanda e insumos" activeTab="mercado" bodyClassName="flex flex-col gap-4 pb-24">
      <div className="flex flex-col gap-5">
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

        <div className="flex justify-between items-center px-1 gap-3">
          <p className="text-[14px] text-gray-600">
            <strong className="font-bold text-gray-900">{headline.split(" ")[0]}</strong> {headline.replace(`${headline.split(" ")[0]} `, "")}
          </p>
          <button
            type="button"
            onClick={() => toast.info("Filtros avanzados y comparacion por zona en la siguiente iteracion.")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ListFilter size={16} strokeWidth={2.5} className="text-gray-400" />
            Filtrar
          </button>
        </div>
      </div>

      {activeTab === "demanda" ? (
        <div className="flex flex-col gap-4 mt-1">
          {buyers.map((buyer) => (
            <UiCard key={buyer.name} className="flex flex-col p-5 shadow-sm border-gray-200 hover:border-emerald-200 transition-colors">
              <div className="flex gap-4 items-center">
                <span className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#1B2533] text-white font-bold text-[17px]">
                  {buyer.initials}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[16px] font-bold text-gray-900 leading-tight">{buyer.name}</h3>
                    {buyer.verified ? <BadgeCheck size={16} strokeWidth={2.5} className="text-[#208843]" /> : null}
                  </div>
                  <p className="text-[13px] font-medium text-gray-400 mt-0.5">{buyer.type}</p>
                </div>
              </div>

              <hr className="my-4 border-gray-100" />

              <div className="flex justify-between items-end mb-4">
                <div>
                  <h4 className="text-[16px] font-bold text-gray-900">{buyer.product}</h4>
                  <p className="text-[13px] font-medium text-gray-500 mt-0.5">
                    {buyer.volume} <span className="opacity-50 mx-0.5">·</span> {buyer.date}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-0.5">OFRECE</span>
                  <div className="flex items-baseline text-[#208843]">
                    <strong className="text-[24px] font-black tracking-tight leading-none">S/ {buyer.price}</strong>
                    <span className="text-[13px] font-bold ml-0.5">/kg</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated && !requireAuth("Crea tu cuenta para postular tu cosecha a compradores verificados.")) {
                    return;
                  }
                  toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                    loading: `Enviando postulacion a ${buyer.name}...`,
                    success: "Postulacion enviada correctamente.",
                    error: "Error al enviar la postulacion."
                  });
                }}
                className="w-full py-4 rounded-xl bg-[#208843] text-white font-bold text-[16px] shadow-sm hover:bg-[#156E3F] transition-colors"
              >
                Postular mi cosecha
              </button>
            </UiCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-1">
          <UiCard className="p-5 border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.9),rgba(255,255,255,1))]">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-emerald-700">Mercado de insumos</p>
            <h3 className="text-[20px] font-black tracking-tight text-gray-900 mt-2">Referencias utiles para decidir mejor</h3>
            <p className="text-[14px] leading-6 text-gray-600 mt-2">
              Compara precios, revisa rangos del mercado y detecta oportunidades sin entrar a un flujo de compra.
            </p>
          </UiCard>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {supplyFilters.map((filter) => {
              const isActive = filter === selectedSupplyFilter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedSupplyFilter(filter)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-[13px] font-bold transition-all ${
                    isActive
                      ? "bg-[#1B2533] text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-200"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {filteredSupplyItems.map((item) => (
            <UiCard key={item.id} className="p-5 shadow-sm border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black tracking-[0.22em] uppercase text-emerald-700">{item.category}</p>
                  <h4 className="text-[18px] font-black tracking-tight text-gray-900 mt-1">{item.title}</h4>
                  <p className="text-[13px] text-gray-500 mt-1">{item.supplier} · {item.presentation}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${item.tone === "good" ? "bg-emerald-50 text-emerald-700" : item.tone === "warn" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                  {item.signalLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Precio actual</p>
                  <p className="text-[22px] font-black tracking-tight text-gray-900 mt-2">{formatCurrency(item.pricePen)}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100">
                  <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Rango</p>
                  <p className="text-[13px] font-bold text-gray-900 mt-3">
                    {formatCurrency(item.marketLowPen)} - {formatCurrency(item.marketHighPen)}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-[13px] text-gray-600 space-y-2">
                <p><span className="font-bold text-gray-900">Uso recomendado:</span> {item.recommendedCrop}</p>
                <p>{item.signalDescription}</p>
                <p className="text-gray-500">{item.updatedLabel}</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated && !requireAuth("Crea tu cuenta para ver detalles tecnicos y guardar referencias de insumos.")) {
                      return;
                    }
                    toast.info(`Detalle tecnico de ${item.title} disponible en la siguiente iteracion.`);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B2533] text-white px-4 py-3 text-[13px] font-bold shadow-sm"
                >
                  <Eye size={16} />
                  Ver detalle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated && !requireAuth("Registrate para seguir precios y guardar alertas de mercado.")) {
                      return;
                    }
                    toast.success(`Seguimiento de precio activado para ${item.title}.`);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700"
                >
                  <BellRing size={16} />
                  Seguir
                </button>
              </div>
            </UiCard>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
