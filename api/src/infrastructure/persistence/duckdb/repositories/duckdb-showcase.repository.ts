import {
  getStaticFarmShowcase,
  getStaticHomeShowcase,
  getStaticMarketBuyersShowcase
} from "../../../../application/showcase/services/showcase-static-data.js";
import type {
  FarmShowcaseResponse,
  HomeShowcaseResponse,
  MarketBuyersShowcaseResponse
} from "../../../../domain/showcase/entities/showcase.entity.js";
import type { ShowcaseRepository } from "../../../../domain/showcase/ports/showcase.repository.js";
import { DuckDbQueryExecutor } from "../clients/duckdb-query-executor.js";

type HomeSummaryRow = {
  latestDate: string;
  location: string;
  alertTitle: string;
  alertMessage: string;
  alertSeverity: "high" | "medium" | "low";
  activeHectares: number;
  parcelCount: number;
  projectedIncomePen: number;
  projectedIncomeDeltaPct: number;
  portfolioRiskTitle: string;
  activeAlertCount: number;
  recommendationTitle: string;
  recommendationRoiPct: number;
  recommendationRiskLabel: string;
  recommendationMessage: string;
};

type FarmProfileRow = {
  farmName: string;
  location: string;
  totalHectares: number;
  parcelCount: number;
  activeCampaigns: number;
  averageRoiPct: number;
  highlightedCertificationsCount: number;
  highlightedCertificationsLabel: string;
  producerName: string;
  producerVerified: boolean;
  producerYears: number;
  closedCampaigns: number;
  historicalRoiPct: number;
  buyerRating: number;
};

export class DuckDbShowcaseRepository implements ShowcaseRepository {
  constructor(private readonly queryExecutor: DuckDbQueryExecutor) {}

  async getHome(): Promise<HomeShowcaseResponse> {
    try {
      const [summary] = await this.queryExecutor.execute<HomeSummaryRow>(`SELECT * FROM home_summary_cache LIMIT 1`);
      const featuredCampaigns = await this.queryExecutor.execute<HomeShowcaseResponse["featuredCampaigns"][number]>(
        `SELECT nombre AS name, codeLabel, riskLabel, riskLevel, stageLabel, harvestWindowLabel, progressPct, projectedPricePen, deltaPct, deltaDirection FROM home_featured_campaigns_cache`
      );
      const priceCards = await this.queryExecutor.execute<HomeShowcaseResponse["priceCards"][number]>(
        `SELECT nombre AS name, pricePen, deltaPct, deltaDirection FROM home_price_cards_cache`
      );
      const upcomingTasks = await this.queryExecutor.execute<HomeShowcaseResponse["upcomingTasks"][number]>(
        `SELECT title, scheduleLabel, severity FROM home_upcoming_tasks_cache`
      );
      const buyers = await this.queryExecutor.execute<HomeShowcaseResponse["buyers"][number]>(
        `SELECT initials, buyerName, verified, buyerType, productoNombre, volumeLabel, deliveryLabel, offeredPricePen, matchScorePct FROM market_buyer_matches_cache`
      );
      const weatherForecast = await this.queryExecutor.execute<HomeShowcaseResponse["weatherForecast"][number]>(
        `SELECT dayLabel, conditionCode, temperatureC FROM home_weather_forecast_cache`
      );
      const regionalStatus = await this.queryExecutor.execute<HomeShowcaseResponse["regionalStatus"][number]>(
        `SELECT label, severity FROM home_regional_status_cache`
      );

      if (!summary) {
        return getStaticHomeShowcase();
      }

      return {
        summary: {
          latestDate: summary.latestDate,
          location: summary.location,
          alert: {
            title: summary.alertTitle,
            message: summary.alertMessage,
            severity: summary.alertSeverity
          },
          stats: {
            activeHectares: Number(summary.activeHectares),
            parcelCount: Number(summary.parcelCount),
            projectedIncomePen: Number(summary.projectedIncomePen),
            projectedIncomeDeltaPct: Number(summary.projectedIncomeDeltaPct),
            portfolioRiskTitle: summary.portfolioRiskTitle,
            activeAlertCount: Number(summary.activeAlertCount)
          },
          recommendation: {
            title: summary.recommendationTitle,
            roiPct: Number(summary.recommendationRoiPct),
            riskLabel: summary.recommendationRiskLabel,
            message: summary.recommendationMessage
          }
        },
        featuredCampaigns,
        priceCards,
        upcomingTasks,
        buyers,
        weatherForecast,
        regionalStatus
      };
    } catch {
      return getStaticHomeShowcase();
    }
  }

  async getMarketBuyers(): Promise<MarketBuyersShowcaseResponse> {
    try {
      const buyers = await this.queryExecutor.execute<MarketBuyersShowcaseResponse["buyers"][number]>(
        `SELECT initials, buyerName, verified, buyerType, productoNombre, volumeLabel, deliveryLabel, offeredPricePen, matchScorePct FROM market_buyer_matches_cache`
      );
      return {
        location: "Ica y valles",
        totalBuyers: buyers.length,
        buyers
      };
    } catch {
      return getStaticMarketBuyersShowcase();
    }
  }

  async getFarm(): Promise<FarmShowcaseResponse> {
    try {
      const [summary] = await this.queryExecutor.execute<FarmProfileRow>(
        `SELECT * FROM farm_profile_cache LIMIT 1`
      );
      const parcels = await this.queryExecutor.execute<FarmShowcaseResponse["parcels"][number]>(
        `SELECT parcelName, cropStageLabel, hectares, riskLabel, riskLevel, progressPct FROM farm_parcels_cache`
      );
      const campaignHistory = await this.queryExecutor.execute<FarmShowcaseResponse["campaignHistory"][number]>(
        `SELECT campaignYear, productoNombre, parcelName, yieldLabel, priceLabel, incomeLabel, roiLabel, roiType FROM farm_campaign_history_cache`
      );
      const certifications = await this.queryExecutor.execute<FarmShowcaseResponse["certifications"][number]>(
        `SELECT certificationName, expiryLabel, severity FROM farm_certifications_cache`
      );

      if (!summary) {
        return getStaticFarmShowcase();
      }

      return {
        summary: {
          farmName: summary.farmName,
          location: summary.location,
          totalHectares: Number(summary.totalHectares),
          parcelCount: Number(summary.parcelCount),
          activeCampaigns: Number(summary.activeCampaigns),
          averageRoiPct: Number(summary.averageRoiPct),
          highlightedCertificationsCount: Number(summary.highlightedCertificationsCount),
          highlightedCertificationsLabel: summary.highlightedCertificationsLabel
        },
        producer: {
          producerName: summary.producerName,
          verified: Boolean(summary.producerVerified),
          producerYears: Number(summary.producerYears),
          closedCampaigns: Number(summary.closedCampaigns),
          historicalRoiPct: Number(summary.historicalRoiPct),
          buyerRating: Number(summary.buyerRating)
        },
        parcels,
        campaignHistory,
        certifications
      };
    } catch {
      return getStaticFarmShowcase();
    }
  }
}
