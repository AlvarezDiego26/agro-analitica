"use client";

import { useMemo, useState } from "react";
import type { MarketplaceTab, SupplyItem } from "../types";

const supplyItems: SupplyItem[] = [
  {
    category: "Fertilizante",
    title: "Fertilizante NPK 20-20-20",
    supplier: "Yara Peru · saco 50kg",
    pricePen: 185
  },
  {
    category: "Fertilizante",
    title: "Sulfato de potasio",
    supplier: "Misti S.A. · saco 50kg",
    pricePen: 142
  },
  {
    category: "Bioestimulante",
    title: "Bioestimulante foliar Algamin",
    supplier: "Silvestre · litro",
    pricePen: 96
  },
  {
    category: "Plaguicida",
    title: "Insecticida Cipermetrina 25%",
    supplier: "Famex · litro",
    pricePen: 58
  }
];

export function useMarketplaceView() {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("insumos");

  const demandFilters = useMemo(() => ["Todos", "Frutas", "Hortalizas", "Cultivos"], []);
  const supplyFilters = useMemo(() => ["Todos", "Fertilizantes", "Bioestimulantes", "Plaguicidas"], []);

  return {
    activeTab,
    setActiveTab,
    demandFilters,
    supplyFilters,
    supplyItems
  };
}
