"use client";

import { useEffect, useState, useTransition } from "react";
import type { DashboardOverviewResponse } from "../types";
import type { HomeShowcaseResponse } from "../../showcase/types";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { formatLongDate } from "./dashboard-helpers";
import { DashboardMetrics } from "./dashboard-metrics";
import { DashboardActiveCampaigns } from "./dashboard-active-campaigns";
import { DashboardRecommendation } from "./dashboard-recommendation";
import { DashboardMarketTrends } from "./dashboard-market-trends";
import { DashboardTasks } from "./dashboard-tasks";
import { DashboardBuyersWeather } from "./dashboard-buyers-weather";
import { getDashboardOverview } from "../services/get-dashboard-overview";
import { CampaignCard } from "./campaign-card";
import { DashboardAlternatives } from "./dashboard-alternatives";
import { views } from "../../../config/views";

type DashboardRange = "7d" | "30d" | "3m" | "1a";

type DesktopHomeScreenProps = {
  dashboard: DashboardOverviewResponse;
  showcase: HomeShowcaseResponse;
  initialCampaigns?: any[];
};

export function DesktopHomeScreen({ dashboard, showcase, initialCampaigns = [] }: Readonly<DesktopHomeScreenProps>) {
  const [timeRange, setTimeRange] = useState<DashboardRange>(dashboard.range ?? "30d");
  const [priceCardOffset, setPriceCardOffset] = useState(0);
  const [marketDashboard, setMarketDashboard] = useState<DashboardOverviewResponse>(dashboard);
  const [dashboardByRange, setDashboardByRange] = useState<Record<DashboardRange, DashboardOverviewResponse | undefined>>({
    "7d": dashboard.range === "7d" ? dashboard : undefined,
    "30d": dashboard.range === "30d" ? dashboard : undefined,
    "3m": dashboard.range === "3m" ? dashboard : undefined,
    "1a": dashboard.range === "1a" ? dashboard : undefined
  });
  const [isPending, startTransition] = useTransition();
  const summary = showcase.summary;
  const featuredProducts = showcase.featuredCampaigns;
  const recommendation = summary.recommendation;
  const buyerHighlights = showcase.buyers.slice(0, 3);

  useEffect(() => {
    if (marketDashboard.marketCards.length <= 4) return;
    const interval = setInterval(() => {
      setPriceCardOffset((prev) => (prev + 2) % marketDashboard.marketCards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [marketDashboard.marketCards.length]);

  useEffect(() => {
    setPriceCardOffset(0);

    const cachedDashboard = dashboardByRange[timeRange];
    if (cachedDashboard) {
      setMarketDashboard(cachedDashboard);
      return;
    }

    let cancelled = false;

    startTransition(() => {
      void getDashboardOverview(timeRange).then((nextDashboard) => {
        if (cancelled) return;
        setMarketDashboard(nextDashboard);
        setDashboardByRange((prev) => ({ ...prev, [timeRange]: nextDashboard }));
      });
    });

    return () => {
      cancelled = true;
    };
  }, [timeRange, dashboardByRange]);

  const [userCampaigns, setUserCampaigns] = useState<any[]>(initialCampaigns);
  const [realHectares, setRealHectares] = useState(() => initialCampaigns.reduce((acc: number, c: any) => acc + (c.hectares || 0), 0));

  useEffect(() => {
    let isMounted = true;
    const fetchCampaigns = () => {
      import("../../planificador/services/get-current-user-campaigns").then(({ getCurrentUserCampaigns }) => {
        getCurrentUserCampaigns().then(res => {
          if (isMounted) {
            setUserCampaigns(res.campaigns);
            const total = res.campaigns.reduce((acc: number, c: any) => acc + (c.hectares || 0), 0);
            setRealHectares(total);
          }
        }).catch(() => {});
      });
    };

    fetchCampaigns();
    window.addEventListener("campaigns-updated", fetchCampaigns);

    return () => { 
      isMounted = false; 
      window.removeEventListener("campaigns-updated", fetchCampaigns);
    };
  }, []);

  const mappedUserCampaigns = userCampaigns.map(c => ({
    name: c.cropName,
    codeLabel: c.campaignStatus === "draft" ? "Borrador" : c.campaignStatus,
    riskLabel: c.plannerRiskLevel === "low" ? "Riesgo bajo" : c.plannerRiskLevel === "medium" ? "Riesgo medio" : "Riesgo alto",
    riskLevel: (c.plannerRiskLevel === "low" ? "low" : c.plannerRiskLevel === "medium" ? "medium" : "high") as "low" | "medium" | "high",
    stageLabel: "Siembra",
    harvestWindowLabel: c.estimatedHarvestDate ? "Próxima cosecha" : "Sin fecha",
    progressPct: 50,
    projectedPricePen: 0,
    deltaPct: 0,
    deltaDirection: "none" as const
  }));

  const activeCampaigns = mappedUserCampaigns.length > 0 ? mappedUserCampaigns : featuredProducts;
  
  const totalIncome = userCampaigns.reduce((acc, c) => {
    const investment = c.estimatedInvestmentPen || (c.hectares * 17500);
    const roi = c.estimatedRoiPct || 0;
    return acc + investment * (1 + roi / 100);
  }, 0);

  const totalInvestment = userCampaigns.reduce((acc, c) => {
    return acc + (c.estimatedInvestmentPen || (c.hectares * 17500));
  }, 0);

  const deltaPct = totalInvestment > 0 ? ((totalIncome - totalInvestment) / totalInvestment) * 100 : 0;

  const highRiskCount = userCampaigns.filter(c => c.plannerRiskLevel === 'high').length;
  const mediumRiskCount = userCampaigns.filter(c => c.plannerRiskLevel === 'medium').length;
  
  let riskStatus = "low";
  if (highRiskCount > 0) riskStatus = "high";
  else if (mediumRiskCount > 0) riskStatus = "medium";
  
  const totalAlerts = highRiskCount + mediumRiskCount;
  
  const realSummary = {
    ...summary,
    stats: {
      ...summary.stats,
      activeHectares: realHectares,
      parcelCount: userCampaigns.length,
      projectedIncomePen: totalIncome,
      projectedIncomeDeltaPct: deltaPct,
      portfolioRisk: {
        level: riskStatus as "low" | "medium" | "high",
        label: riskStatus === "high" ? "Alto" : riskStatus === "medium" ? "Medio" : "Bajo",
        description: totalAlerts > 0 ? `${totalAlerts} de ${userCampaigns.length} en alerta` : "Todo en orden"
      }
    }
  };

  const realAlerts = userCampaigns.length > 0
    ? userCampaigns
        .filter(c => c.plannerRiskLevel === 'high')
        .map(c => ({
          severity: 'high' as const,
          title: `Riesgo ALTO en ${c.cropName}`,
          message: `El ROI proyectado para tu campaña de ${c.cropName} indica un riesgo alto. Considera revisar el planificador.`
        }))
    : marketDashboard.alerts;

  return (
    <DashboardShell
      title="Inicio"
      subtitle={marketDashboard.overview.latestDate ? `Panel general · ${formatLongDate(marketDashboard.overview.latestDate)}` : "Panel general"}
      activeTab="inicio"
      showHeaderActions
      bodyClassName="flex flex-col gap-5 pb-6"
      headerAlerts={realAlerts}
    >


      <DashboardMetrics summary={realSummary} />

      {userCampaigns.length > 0 ? (
        <div className="flex flex-col gap-5 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-black tracking-tight text-gray-900">Tus Campañas Activas</h3>
              <p className="text-[13px] font-medium text-gray-500 mt-1">Gestiona tus planificaciones y haz seguimiento al mercado.</p>
            </div>
            <a href={views.planner} className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              + Nueva Campaña
            </a>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 items-start">
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userCampaigns.map((campaign: any) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
            
            <div className="w-full lg:w-[320px] shrink-0">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 h-full">
                <DashboardAlternatives layout="vertical" limit={Math.min(3, Math.max(1, Math.ceil(userCampaigns.length / 2)))} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-5">
          <DashboardActiveCampaigns featuredProducts={activeCampaigns} summary={realSummary} />
          <DashboardRecommendation recommendation={recommendation} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 xl:gap-5 mt-2">
        <DashboardMarketTrends
          dashboard={marketDashboard}
          priceCardOffset={priceCardOffset}
          setPriceCardOffset={setPriceCardOffset}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          isLoading={isPending}
        />
        <DashboardTasks upcomingTasks={showcase.upcomingTasks} hasActiveCampaigns={realHectares > 0} />
        <DashboardBuyersWeather
          buyerHighlights={buyerHighlights}
          weatherForecast={showcase.weatherForecast}
          location={summary.location}
        />
      </div>
    </DashboardShell>
  );
}
