type RiskLevel = "high" | "medium" | "low";

export type HomeShowcaseResponse = {
  summary: {
    latestDate: string;
    location: string;
    alert: {
      title: string;
      message: string;
      severity: RiskLevel;
    };
    stats: {
      activeHectares: number;
      parcelCount: number;
      projectedIncomePen: number;
      projectedIncomeDeltaPct: number;
      portfolioRiskTitle: string;
      activeAlertCount: number;
    };
    recommendation: {
      title: string;
      roiPct: number;
      riskLabel: string;
      message: string;
    };
  };
  featuredCampaigns: Array<{
    name: string;
    codeLabel: string;
    riskLabel: string;
    riskLevel: RiskLevel;
    stageLabel: string;
    harvestWindowLabel: string;
    progressPct: number;
    projectedPricePen: number;
    deltaPct: number;
    deltaDirection: "up" | "down" | "none";
  }>;
  priceCards: Array<{
    name: string;
    pricePen: number;
    deltaPct: number;
    deltaDirection: "up" | "down";
  }>;
  upcomingTasks: Array<{
    title: string;
    scheduleLabel: string;
    severity: RiskLevel;
  }>;
  buyers: Array<{
    initials: string;
    buyerName: string;
    verified: boolean;
    buyerType: string;
    productoNombre: string;
    volumeLabel: string;
    deliveryLabel: string;
    offeredPricePen: number;
    matchScorePct: number;
  }>;
  weatherForecast: Array<{
    dayLabel: string;
    conditionCode: "sun" | "cloud" | "rain";
    temperatureC: number;
  }>;
  regionalStatus: Array<{
    label: string;
    severity: RiskLevel;
  }>;
};

export type MarketBuyersShowcaseResponse = {
  location: string;
  totalBuyers: number;
  buyers: HomeShowcaseResponse["buyers"];
};

type FarmShowcaseResponse = {
  summary: {
    farmName: string;
    location: string;
    totalHectares: number;
    parcelCount: number;
    activeCampaigns: number;
    averageRoiPct: number;
    highlightedCertificationsCount: number;
    highlightedCertificationsLabel: string;
  };
  producer: {
    producerName: string;
    verified: boolean;
    producerYears: number;
    closedCampaigns: number;
    historicalRoiPct: number;
    buyerRating: number;
  };
  parcels: Array<{
    parcelName: string;
    cropStageLabel: string;
    hectares: number;
    riskLabel: string;
    riskLevel: RiskLevel;
    progressPct: number;
  }>;
  campaignHistory: Array<{
    campaignYear: string;
    productoNombre: string;
    parcelName: string;
    yieldLabel: string;
    priceLabel: string;
    incomeLabel: string;
    roiLabel: string;
    roiType: "positive" | "negative";
  }>;
  certifications: Array<{
    certificationName: string;
    expiryLabel: string;
    severity: RiskLevel;
  }>;
};
