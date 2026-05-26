export type MarketOverview = {
  overview: {
    latestDate: string | null;
    totalRecords: number;
    productCount: number;
    destinationCount: number;
    totalUsd: number | null;
    totalNetWeightKg: number | null;
    averageUsdPerKg: number | null;
  };
  topProducts: Array<{
    productoKey: string;
    productoNombre: string;
    categoriaProducto: string | null;
    totalUsd: number | null;
    totalNetWeightKg: number | null;
    averageUsdPerKg: number | null;
    operationCount: number;
  }>;
  topDestinations: Array<{
    destinoCodigo: string;
    destinoNombre: string;
    totalUsd: number | null;
    totalNetWeightKg: number | null;
    operationCount: number;
  }>;
};

export type MarketplaceTab = "demanda" | "insumos";

type SupplyInsightTone = "good" | "warn" | "neutral";

export type SupplyFilter =
  | "Todos"
  | "Fertilizantes"
  | "Bioestimulantes"
  | "Plaguicidas"
  | "Semillas"
  | "Riego"
  | "Herramientas";

export type SupplyItem = {
  id: string;
  category: SupplyFilter;
  title: string;
  supplier: string;
  presentation: string;
  regionLabel: string;
  updatedLabel: string;
  recommendedCrop: string;
  useCase: string;
  pricePen: number;
  marketLowPen: number;
  marketHighPen: number;
  signalLabel: string;
  signalDescription: string;
  tone: SupplyInsightTone;
};
