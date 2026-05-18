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

export type SupplyItem = {
  category: string;
  title: string;
  supplier: string;
  pricePen: number;
};
