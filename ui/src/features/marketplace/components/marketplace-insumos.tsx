"use client";

import { BadgeDollarSign, BellRing, Eye, Leaf, Sprout, TestTubeDiagonal, Wrench } from "lucide-react";
import { toast } from "sonner";
import { UiCard } from "../../../components/ui/ui-card";
import { formatCurrency } from "../../dashboard/components/dashboard-helpers";
import { useAuth } from "../../../providers/auth-provider";
import type { SupplyFilter, SupplyItem } from "../types";

type MarketplaceInsumosProps = {
  filters: SupplyFilter[];
  selectedFilter: SupplyFilter;
  onSelectFilter: (filter: SupplyFilter) => void;
  items: SupplyItem[];
};

export function MarketplaceInsumos({
  filters,
  selectedFilter,
  onSelectFilter,
  items
}: Readonly<MarketplaceInsumosProps>) {
  const { isAuthenticated, requireAuth } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <UiCard className="px-6 py-5 border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.9),rgba(255,255,255,1))]">
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-emerald-700">Mercado de insumos</p>
            <h3 className="text-[22px] font-black tracking-tight text-gray-900 mt-2">
              Referencias utiles para decidir mejor antes de comprar
            </h3>
            <p className="text-[14px] leading-7 text-gray-600 mt-2">
              Compara precios de referencia, rango de mercado y señales simples para saber si un insumo
              esta conveniente, estable o por encima del promedio en tu zona.
            </p>
          </div>
          <div className="hidden xl:flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 border border-emerald-100 shadow-sm">
            <BadgeDollarSign size={18} className="text-emerald-600" />
            <div>
              <p className="text-[12px] font-bold text-gray-900">Enfoque actual</p>
              <p className="text-[12px] text-gray-500">Comparar, seguir precio y ver detalle.</p>
            </div>
          </div>
        </div>
      </UiCard>

      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = filter === selectedFilter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => onSelectFilter(filter)}
              className={`rounded-full px-4 py-2.5 text-[13px] font-bold transition-all ${
                isActive
                  ? "bg-[#1B2533] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-200 hover:text-gray-900"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
        {items.map((item) => (
          <UiCard key={item.id} className="p-5 border-gray-200 hover:border-emerald-200 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getToneIconContainerClassName(item.tone)}`}>
                  {renderSupplyIcon(item.category)}
                </div>
                <div>
                  <p className="text-[11px] font-black tracking-[0.22em] uppercase text-emerald-700">{item.category}</p>
                  <h3 className="text-[18px] font-black tracking-tight text-gray-900 mt-1">{item.title}</h3>
                </div>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${getToneBadgeClassName(item.tone)}`}>
                {item.signalLabel}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100">
                <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Precio actual</p>
                <p className="text-[24px] font-black tracking-tight text-gray-900 mt-2">{formatCurrency(item.pricePen)}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100">
                <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gray-400">Rango mercado</p>
                <p className="text-[15px] font-bold text-gray-900 mt-3">
                  {formatCurrency(item.marketLowPen)} - {formatCurrency(item.marketHighPen)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[13px] text-gray-600">
              <p>
                <span className="font-bold text-gray-900">Proveedor:</span> {item.supplier} · {item.presentation}
              </p>
              <p>
                <span className="font-bold text-gray-900">Referencia:</span> {item.regionLabel}
              </p>
              <p>
                <span className="font-bold text-gray-900">Uso recomendado:</span> {item.recommendedCrop}
              </p>
              <p>{item.useCase}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3">
              <p className="text-[12px] font-bold text-gray-900">Señal del mercado</p>
              <p className="text-[13px] text-gray-600 mt-1">{item.signalDescription}</p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-gray-500">
              <span>{item.updatedLabel}</span>
              <span className="font-semibold">{item.presentation}</span>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated && !requireAuth("Crea tu cuenta para ver detalles tecnicos y guardar referencias de insumos.")) {
                    return;
                  }
                  toast.info(`Detalle tecnico de ${item.title} disponible en la siguiente iteracion.`);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B2533] text-white px-4 py-3 text-[13px] font-bold shadow-sm hover:bg-gray-800 transition-colors"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <BellRing size={16} />
                Seguir precio
              </button>
            </div>
          </UiCard>
        ))}
      </div>
    </div>
  );
}

function renderSupplyIcon(category: SupplyItem["category"]) {
  switch (category) {
    case "Fertilizantes":
      return <Leaf size={22} className="text-emerald-700" />;
    case "Bioestimulantes":
      return <Sprout size={22} className="text-emerald-700" />;
    case "Plaguicidas":
      return <TestTubeDiagonal size={22} className="text-amber-700" />;
    case "Herramientas":
      return <Wrench size={22} className="text-slate-700" />;
    default:
      return <BadgeDollarSign size={22} className="text-sky-700" />;
  }
}

function getToneBadgeClassName(tone: SupplyItem["tone"]) {
  if (tone === "good") return "bg-emerald-50 text-emerald-700";
  if (tone === "warn") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function getToneIconContainerClassName(tone: SupplyItem["tone"]) {
  if (tone === "good") return "bg-emerald-50 border border-emerald-100";
  if (tone === "warn") return "bg-amber-50 border border-amber-100";
  return "bg-slate-100 border border-slate-200";
}
