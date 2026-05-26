"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Globe, Sparkles } from "lucide-react";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";
import { DashboardMarketTrends } from "./dashboard-market-trends";
import type { DashboardOverviewResponse } from "../types";
import type { HomeShowcaseResponse } from "../../showcase/types";

type VisitorHomeProps = {
  dashboard: DashboardOverviewResponse;
  showcase: HomeShowcaseResponse;
};

export function VisitorHome({ dashboard, showcase }: Readonly<VisitorHomeProps>) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "3m" | "1a">(dashboard.range ?? "30d");
  const [priceCardOffset, setPriceCardOffset] = useState(0);

  return (
    <DashboardShell
      title="Exploracion publica"
      subtitle="Bienvenido a AgroAnalitica. Aqui tienes un vistazo de lo que pasa en el mercado hoy."
      activeTab="inicio"
      showHeaderActions
      bodyClassName="flex flex-col gap-8 pb-12"
    >
      <div className="relative overflow-hidden rounded-[24px] bg-[#111827] text-white p-8 md:p-12 border border-gray-800 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Globe size={300} strokeWidth={1} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[12px] font-black uppercase tracking-widest mb-6">
            <Sparkles size={14} /> Plataforma de Análisis Agrícola
          </div>
          <h1 className="text-[36px] md:text-[48px] font-black tracking-tight leading-[1.1] mb-6">
            Mira cómo se están moviendo los precios antes de sembrar.
          </h1>
          <p className="text-[18px] text-gray-400 mb-8 leading-relaxed font-medium">
            Analizamos el histórico de precios mayoristas para darte una idea clara del mercado. Planifica tu siembra con datos reales y toma mejores decisiones para tu campaña.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={views.login}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-[15px] font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              Iniciar Sesion para Planificar <ArrowRight size={18} />
            </Link>
            <Link
              href={views.market}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-[15px] font-bold text-white hover:bg-white/20 transition-colors"
            >
              Explorar el mercado global
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <DashboardMarketTrends
          dashboard={dashboard}
          priceCardOffset={priceCardOffset}
          setPriceCardOffset={setPriceCardOffset}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
        />
        
        <div className="col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1 mt-1">
            <div>
              <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Cultivos Recomendados</h3>
              <p className="text-[13px] font-medium text-gray-400">Mejor proyeccion actual</p>
            </div>
          </div>
          <UiCard className="p-0 border-gray-200 overflow-hidden shadow-sm flex-1">
            <div className="flex flex-col divide-y divide-gray-100 h-full">
              {dashboard.topProducts.slice(0, 4).map((product) => (
                <div key={product.productoNombre} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <BarChart3 size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-gray-900">{product.productoNombre}</p>
                      <p className="text-[12px] font-medium text-gray-500">{product.recordCount} registros hoy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-black text-gray-900 tracking-tight">S/ {product.averagePrice.toFixed(2)}</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Promedio</p>
                  </div>
                </div>
              ))}
            </div>
          </UiCard>
        </div>
      </div>
    </DashboardShell>
  );
}
