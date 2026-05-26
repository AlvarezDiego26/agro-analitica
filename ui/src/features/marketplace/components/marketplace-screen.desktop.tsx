"use client";

import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { useMarketplaceView } from "../hooks/use-marketplace-view";
import type { MarketOverview } from "../types";
import type { MarketBuyersShowcaseResponse } from "../../showcase/types";
import { MarketplaceHeader } from "./marketplace-header";
import { MarketplaceDemanda } from "./marketplace-demanda";
import { MarketplaceInsumos } from "./marketplace-insumos";

type DesktopMarketplaceScreenProps = {
  market: MarketOverview;
  buyersShowcase: MarketBuyersShowcaseResponse;
  preSelectedProduct?: string;
};

export function DesktopMarketplaceScreen({ buyersShowcase }: Readonly<DesktopMarketplaceScreenProps>) {
  const {
    activeTab,
    setActiveTab,
    supplyItems,
    filteredSupplyItems,
    supplyFilters,
    selectedSupplyFilter,
    setSelectedSupplyFilter
  } = useMarketplaceView();

  return (
    <DashboardShell
      title="Mercado"
      subtitle={`Demanda e insumos · ${buyersShowcase.location}`}
      activeTab="mercado"
      showHeaderActions
      bodyClassName="flex flex-col gap-6 pb-8"
    >
      <div className="flex flex-col gap-6 w-full">
        <MarketplaceHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          buyersShowcase={buyersShowcase}
          supplyItemsCount={supplyItems.length}
        />

        {activeTab === "demanda" ? (
          <MarketplaceDemanda buyersShowcase={buyersShowcase} />
        ) : (
          <MarketplaceInsumos
            filters={supplyFilters}
            selectedFilter={selectedSupplyFilter}
            onSelectFilter={setSelectedSupplyFilter}
            items={filteredSupplyItems}
          />
        )}
      </div>
    </DashboardShell>
  );
}
