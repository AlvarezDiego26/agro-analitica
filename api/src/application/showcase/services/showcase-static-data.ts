import type {
  FarmShowcaseResponse,
  HomeShowcaseResponse,
  MarketBuyersShowcaseResponse
} from "../../../domain/showcase/entities/showcase.entity.js";

const buyers: HomeShowcaseResponse["buyers"] = [
  {
    initials: "AP",
    buyerName: "AgroExport Perú SAC",
    verified: true,
    buyerType: "Exportación - EE.UU.",
    productoNombre: "Palta Hass",
    volumeLabel: "15 ton",
    deliveryLabel: "Cosecha mayo 2026",
    offeredPricePen: 8.2,
    matchScorePct: 96
  },
  {
    initials: "C",
    buyerName: "Camposol",
    verified: true,
    buyerType: "Calidad premium",
    productoNombre: "Espárrago verde",
    volumeLabel: "8 ton",
    deliveryLabel: "Entrega abril",
    offeredPricePen: 3.9,
    matchScorePct: 88
  },
  {
    initials: "Fd",
    buyerName: "Frutícola del Sur",
    verified: false,
    buyerType: "Mercado local",
    productoNombre: "Uva Red Globe",
    volumeLabel: "20 ton",
    deliveryLabel: "Cosecha junio",
    offeredPricePen: 6.5,
    matchScorePct: 74
  },
  {
    initials: "Bd",
    buyerName: "Beta del Pacífico",
    verified: true,
    buyerType: "Exportación - China",
    productoNombre: "Arándano",
    volumeLabel: "2 ton",
    deliveryLabel: "Cosecha agosto",
    offeredPricePen: 18.4,
    matchScorePct: 42
  },
  {
    initials: "PI",
    buyerName: "Procesadora Ica",
    verified: true,
    buyerType: "Industrial",
    productoNombre: "Cebolla amarilla",
    volumeLabel: "40 ton",
    deliveryLabel: "Continuo",
    offeredPricePen: 1.4,
    matchScorePct: 68
  }
];

export function getStaticHomeShowcase(): HomeShowcaseResponse {
  return {
    summary: {
      latestDate: "2026-03-16",
      location: "Ica",
      alert: {
        title: "Riesgo ALTO de sobreoferta de Espárrago en Pisco — marzo",
        message: "+38% de intenciones de siembra vs. campaña anterior · SISAP",
        severity: "high"
      },
      stats: {
        activeHectares: 14.7,
        parcelCount: 3,
        projectedIncomePen: 182000,
        projectedIncomeDeltaPct: 6.4,
        portfolioRiskTitle: "Medio",
        activeAlertCount: 1
      },
      recommendation: {
        title: "Considera sembrar Palta Hass en lugar de Espárrago este abril.",
        roiPct: 34,
        riskLabel: "Bajo",
        message:
          "Hay sobreoferta proyectada de espárrago en tu valle. La palta muestra demanda creciente de exportación a EE.UU."
      }
    },
    featuredCampaigns: [
      {
        name: "Espárrago verde",
        codeLabel: "UC-157 · 8.5 ha",
        riskLabel: "Riesgo Medio",
        riskLevel: "medium",
        stageLabel: "CRECIMIENTO",
        harvestWindowLabel: "48D A COSECHA",
        progressPct: 60,
        projectedPricePen: 3.4,
        deltaPct: 4.2,
        deltaDirection: "down"
      },
      {
        name: "Uva Red Globe",
        codeLabel: "Floración · 4 ha",
        riskLabel: "Riesgo Bajo",
        riskLevel: "low",
        stageLabel: "FLORACIÓN",
        harvestWindowLabel: "120D A COSECHA",
        progressPct: 30,
        projectedPricePen: 6.1,
        deltaPct: 2.8,
        deltaDirection: "up"
      },
      {
        name: "Palta Hass",
        codeLabel: "Pre-cosecha · 2.2 ha",
        riskLabel: "Riesgo Bajo",
        riskLevel: "low",
        stageLabel: "PRE-COSECHA",
        harvestWindowLabel: "18D A COSECHA",
        progressPct: 90,
        projectedPricePen: 7.8,
        deltaPct: 5.1,
        deltaDirection: "up"
      }
    ],
    priceCards: [
      { name: "Uva", pricePen: 6.1, deltaPct: 2.8, deltaDirection: "up" },
      { name: "Espárrago", pricePen: 3.4, deltaPct: 4.2, deltaDirection: "down" },
      { name: "Palta", pricePen: 7.8, deltaPct: 5.1, deltaDirection: "up" },
      { name: "Cebolla", pricePen: 1.25, deltaPct: 1.4, deltaDirection: "down" }
    ],
    upcomingTasks: [
      { title: "Aplicar fertilizante NPK", scheduleLabel: "Hoy · Parcela Norte", severity: "high" },
      { title: "Inspección plagas", scheduleLabel: "Mar 18 · Parcela Sur", severity: "low" },
      { title: "Riego programado", scheduleLabel: "Mar 20 · Parcela Oeste", severity: "low" },
      { title: "Cosecha Palta Hass", scheduleLabel: "Mar 22 · Parcela Oeste", severity: "high" }
    ],
    buyers,
    weatherForecast: [
      { dayLabel: "Lun", conditionCode: "sun", temperatureC: 24 },
      { dayLabel: "Mar", conditionCode: "sun", temperatureC: 25 },
      { dayLabel: "Mié", conditionCode: "cloud", temperatureC: 22 },
      { dayLabel: "Jue", conditionCode: "rain", temperatureC: 21 },
      { dayLabel: "Vie", conditionCode: "sun", temperatureC: 23 }
    ],
    regionalStatus: [
      { label: "Espárrago: sobreoferta", severity: "high" },
      { label: "Palta: demanda alta", severity: "low" },
      { label: "Uva: estable", severity: "medium" }
    ]
  };
}

export function getStaticMarketBuyersShowcase(): MarketBuyersShowcaseResponse {
  return {
    location: "Ica y valles",
    totalBuyers: 4,
    buyers
  };
}

export function getStaticFarmShowcase(): FarmShowcaseResponse {
  return {
    summary: {
      farmName: "Fundo San Juan",
      location: "Ica",
      totalHectares: 14.7,
      parcelCount: 3,
      activeCampaigns: 3,
      averageRoiPct: 18,
      highlightedCertificationsCount: 2,
      highlightedCertificationsLabel: "Global G.A.P. · SENASA"
    },
    producer: {
      producerName: "Manuel Quispe",
      verified: true,
      producerYears: 4,
      closedCampaigns: 12,
      historicalRoiPct: 14.8,
      buyerRating: 4.8
    },
    parcels: [
      {
        parcelName: "Parcela Norte",
        cropStageLabel: "Espárrago verde · Crecimiento",
        hectares: 8.5,
        riskLabel: "Riesgo Medio",
        riskLevel: "medium",
        progressPct: 62
      },
      {
        parcelName: "Parcela Sur",
        cropStageLabel: "Uva Red Globe · Floración",
        hectares: 4,
        riskLabel: "Riesgo Bajo",
        riskLevel: "low",
        progressPct: 34
      },
      {
        parcelName: "Parcela Oeste",
        cropStageLabel: "Palta Hass · Pre-cosecha",
        hectares: 2.2,
        riskLabel: "Riesgo Bajo",
        riskLevel: "low",
        progressPct: 88
      }
    ],
    campaignHistory: [
      {
        campaignYear: "2025",
        productoNombre: "Espárrago verde",
        parcelName: "Norte",
        yieldLabel: "12.4 t/ha",
        priceLabel: "S/ 3.85",
        incomeLabel: "S/ 41,200",
        roiLabel: "+18%",
        roiType: "positive"
      },
      {
        campaignYear: "2024",
        productoNombre: "Cebolla amarilla",
        parcelName: "Norte",
        yieldLabel: "38 t/ha",
        priceLabel: "S/ 1.40",
        incomeLabel: "S/ 18,090",
        roiLabel: "-8%",
        roiType: "negative"
      },
      {
        campaignYear: "2024",
        productoNombre: "Uva Red Globe",
        parcelName: "Sur",
        yieldLabel: "18 t/ha",
        priceLabel: "S/ 5.90",
        incomeLabel: "S/ 42,480",
        roiLabel: "+22%",
        roiType: "positive"
      },
      {
        campaignYear: "2023",
        productoNombre: "Espárrago verde",
        parcelName: "Norte",
        yieldLabel: "10.8 t/ha",
        priceLabel: "S/ 3.20",
        incomeLabel: "S/ 20,376",
        roiLabel: "+4%",
        roiType: "positive"
      },
      {
        campaignYear: "2023",
        productoNombre: "Palta Hass",
        parcelName: "Oeste",
        yieldLabel: "9.2 t/ha",
        priceLabel: "S/ 7.10",
        incomeLabel: "S/ 14,375",
        roiLabel: "+28%",
        roiType: "positive"
      }
    ],
    certifications: [
      { certificationName: "Global G.A.P.", expiryLabel: "Vence Nov 2026", severity: "low" },
      { certificationName: "SENASA - Buenas Prácticas", expiryLabel: "Vence Feb 2027", severity: "low" },
      { certificationName: "Comercio Justo", expiryLabel: "Vence May 2026", severity: "medium" }
    ]
  };
}
