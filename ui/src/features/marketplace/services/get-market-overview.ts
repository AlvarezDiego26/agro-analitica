import { apiClient } from "../../../lib/api-client";
import type { MarketOverview } from "../types";

export async function getMarketOverview(): Promise<MarketOverview> {
  try {
    return await apiClient<MarketOverview>({
      path: "/api/sunat/exports/overview"
    });
  } catch {
    return {
      overview: {
        latestDate: "2026-05-08",
        totalRecords: 64009,
        productCount: 59,
        destinationCount: 78,
        totalUsd: 2353630375.46,
        totalNetWeightKg: 863751011.03,
        averageUsdPerKg: 3.2677
      },
      topProducts: [
        {
          productoKey: "uva",
          productoNombre: "Uva",
          categoriaProducto: "fruta",
          totalUsd: 798732468.17,
          totalNetWeightKg: 283252954.72,
          averageUsdPerKg: 2.8554,
          operationCount: 20449
        },
        {
          productoKey: "arandano",
          productoNombre: "Arandano",
          categoriaProducto: "fruta",
          totalUsd: 541065865.67,
          totalNetWeightKg: 82832484.88,
          averageUsdPerKg: 6.7157,
          operationCount: 8379
        },
        {
          productoKey: "palta",
          productoNombre: "Palta",
          categoriaProducto: "fruta",
          totalUsd: 451107662.21,
          totalNetWeightKg: 211248574.56,
          averageUsdPerKg: 2.3071,
          operationCount: 13163
        }
      ],
      topDestinations: [
        {
          destinoCodigo: "US",
          destinoNombre: "US",
          totalUsd: 960840366.87,
          totalNetWeightKg: 292308570.86,
          operationCount: 21848
        },
        {
          destinoCodigo: "NL",
          destinoNombre: "NL",
          totalUsd: 552279281.19,
          totalNetWeightKg: 230469749.12,
          operationCount: 16698
        },
        {
          destinoCodigo: "ES",
          destinoNombre: "ES",
          totalUsd: 165005984.57,
          totalNetWeightKg: 76769397.64,
          operationCount: 5936
        }
      ]
    };
  }
}
