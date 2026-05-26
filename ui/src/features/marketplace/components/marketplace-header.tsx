import { Truck, ShoppingCart, ListFilter } from "lucide-react";
import { toast } from "sonner";
import type { MarketBuyersShowcaseResponse } from "../../showcase/types";
import type { MarketplaceTab } from "../types";

export type MarketplaceHeaderProps = {
  activeTab: MarketplaceTab;
  setActiveTab: (tab: MarketplaceTab) => void;
  buyersShowcase: MarketBuyersShowcaseResponse;
  supplyItemsCount: number;
};

export function MarketplaceHeader({
  activeTab,
  setActiveTab,
  buyersShowcase,
  supplyItemsCount
}: MarketplaceHeaderProps) {
  const headline =
    activeTab === "demanda"
      ? `${buyersShowcase.totalBuyers} compradores`
      : `${supplyItemsCount} referencias de insumos`;

  const locationLabel = activeTab === "demanda" ? buyersShowcase.location : "Ica y sierra centro";

  return (
    <div className="flex justify-between items-center w-full">
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

      <div className="flex items-center gap-4">
        <p className="text-[13px] font-medium text-gray-400">
          <strong className="font-bold text-gray-900">{headline}</strong> · {locationLabel}
        </p>
        <button
          type="button"
          onClick={() => toast.info("Filtros avanzados y comparacion por zona en la siguiente iteracion.")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ListFilter size={16} strokeWidth={2.5} className="text-gray-400" />
          Filtros
        </button>
      </div>
    </div>
  );
}
