"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, LineChart, TrendingUp } from "lucide-react";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";
import { useAuth } from "../../../providers/auth-provider";
import { DashboardMarketTrends } from "./dashboard-market-trends";
import { DashboardBuyersWeather } from "./dashboard-buyers-weather";
import { DashboardAlternatives } from "./dashboard-alternatives";
import type { DashboardOverviewResponse } from "../types";
import type { HomeShowcaseResponse } from "../../showcase/types";

type DashboardRange = "7d" | "30d" | "3m" | "1a";

type NewUserHomeProps = {
  dashboard: DashboardOverviewResponse;
  showcase: HomeShowcaseResponse;
};

export function NewUserHome({ dashboard, showcase }: Readonly<NewUserHomeProps>) {
  const { currentUser } = useAuth();
  const firstName = currentUser?.profile.fullName.split(" ")[0] ?? "productor";
  
  const [timeRange, setTimeRange] = useState<DashboardRange>(dashboard.range ?? "30d");
  const [priceCardOffset, setPriceCardOffset] = useState(0);

  const topMomentum = dashboard.marketCards
    .filter((item) => item.deltaDirection === "up")
    .sort((left, right) => right.deltaPct - left.deltaPct)[0] ?? dashboard.marketCards[0] ?? null;

  return (
    <DashboardShell
      title={`Bienvenido, ${firstName}`}
      subtitle="Tu cuenta esta lista. Te mostramos primero oportunidades reales del mercado para que tomes una mejor decision."
      activeTab="inicio"
      showHeaderActions
      bodyClassName="flex flex-col gap-6 pb-8"
    >
      <UiCard className="p-6 md:p-8 border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(255,255,255,1))]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-4xl">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-emerald-700">NUEVO USUARIO</p>
            <h2 className="text-[28px] font-black tracking-tight text-gray-900 mt-2">
              Explora el mercado antes de registrar tu primera finca
            </h2>
            <p className="text-[15px] leading-7 text-gray-600 mt-3">
              {topMomentum
                ? `${topMomentum.productoNombre} muestra una tendencia interesante hoy. Revisa el mercado actual y usa el planificador para ver el historial de precios antes de sembrar.`
                : "Revisa cómo varían los precios y usa el planificador para tomar una decisión informada sobre qué cultivar en tu región."}
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-white px-5 py-5 shadow-sm min-w-[320px] flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Compass size={22} />
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">Paso Sugerido</p>
                <p className="text-[15px] font-bold text-gray-900 mt-1">Usa el planificador de cultivos</p>
              </div>
            </div>
            <Link
              href={views.planner}
              className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-[14px] font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              Ir al Planificador
            </Link>
          </div>
        </div>
      </UiCard>

      <DashboardAlternatives />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-2">
        <DashboardMarketTrends
          dashboard={dashboard}
          priceCardOffset={priceCardOffset}
          setPriceCardOffset={setPriceCardOffset}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
        
        <DashboardBuyersWeather
          buyerHighlights={showcase.buyers.slice(0, 3)}
          weatherForecast={showcase.weatherForecast}
          location={showcase.summary.location}
        />
      </div>
    </DashboardShell>
  );
}
