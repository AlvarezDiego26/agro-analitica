//...
//...
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { DashboardOverviewResponse } from "../types";
import { UiCard } from "../../../components/ui/ui-card";
import { deltaTextClassName, formatCurrency, formatLongDate, formatPercent } from "./dashboard-helpers";

import * as React from "react";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, Bar, Legend } from "recharts";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type DashboardMarketTrendsProps = {
  dashboard: DashboardOverviewResponse;
  priceCardOffset: number;
  setPriceCardOffset: React.Dispatch<React.SetStateAction<number>>;
  timeRange: "7d" | "30d" | "3m" | "1a";
  setTimeRange: (val: "7d" | "30d" | "3m" | "1a") => void;
  isLoading?: boolean;
};

export function DashboardMarketTrends({
  dashboard,
  priceCardOffset,
  setPriceCardOffset,
  timeRange,
  setTimeRange,
  isLoading = false
}: DashboardMarketTrendsProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = React.useState<typeof dashboard.marketCards[0] | null>(null);

  const cards = dashboard.marketCards;
  const visiblePriceCards = (() => {
    if (cards.length <= 4) return cards;
    const slice1 = cards.slice(priceCardOffset, priceCardOffset + 4);
    if (slice1.length < 4) {
      const needed = 4 - slice1.length;
      return [...slice1, ...cards.slice(0, needed)];
    }
    return slice1;
  })();

  return (
    <>
    <section className="col-span-1 xl:col-span-2 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1 mt-1">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Precios mercado Lima</h3>
          <p className="text-[13px] font-medium text-gray-400">
            Cierre {formatLongDate(dashboard.overview.latestDate)} · S/ por kg
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cards.length > 4 && (
            <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm mr-1">
              <button
                onClick={() => {
                  setPriceCardOffset((prev) => (prev - 2 + cards.length) % cards.length);
                }}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-all"
                title="Anterior"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => {
                  setPriceCardOffset((prev) => (prev + 2) % cards.length);
                }}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-all"
                title="Siguiente"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
          <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
            {(["7d", "30d", "3m", "1a"] as const).map((value) => (
              <button
                key={value}
                onClick={() => {
                  setTimeRange(value);
                  router.push(`?range=${value}`);
                }}
                className={`px-2 py-1 text-[11px] font-bold rounded transition-all ${timeRange === value ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
        {visiblePriceCards.map((item) => {
          const isUp = item.deltaDirection !== "down";
          const color = isUp ? "#10B981" : "#EF4444";
          const bgColor = isUp ? "#D1FAE5" : "#FEE2E2";

          return (
            <UiCard
              key={item.productoNombre}
              className={`flex flex-col p-4 justify-between min-h-[160px] shadow-sm border-gray-200 relative overflow-hidden transition-all duration-300 cursor-pointer hover:border-emerald-300 hover:shadow-md ${
                isLoading ? "opacity-75" : ""
              }`}
              onClick={() => setSelectedProduct(item)}
            >
              <div className="flex justify-between items-start z-10 relative pointer-events-none">
                <span className="text-[14px] font-bold text-gray-700">{item.productoNombre}</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[12px] font-bold ${deltaTextClassName(item.deltaDirection)}`}
                >
                  {item.deltaDirection === "up" ? (
                    <ArrowUp size={14} strokeWidth={3} />
                  ) : item.deltaDirection === "down" ? (
                    <ArrowDown size={14} strokeWidth={3} />
                  ) : null}
                  {formatPercent(item.deltaPct)}
                </span>
              </div>
              <div className="mt-1 z-10 relative pointer-events-none">
                <strong className="text-[22px] font-black text-gray-900 tracking-tight">
                  {formatCurrency(item.latestPrice)}
                  <span className="text-[12px] font-bold text-gray-400">/kg</span>
                </strong>
              </div>
              
              {/* Interactive Chart */}
              <div className="absolute left-0 right-0 bottom-0 h-[80px] w-full pt-4 min-w-0 min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                  <ComposedChart data={item.series.slice(-14)} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`color-${item.productoNombre.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id={`color-pred-${item.productoNombre.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-gray-900/90 text-white px-3 py-2 rounded-lg shadow-xl text-[12px] font-medium backdrop-blur-sm border border-gray-800 pointer-events-none z-50">
                              <p className="font-bold text-gray-300 mb-1">{formatLongDate(data.fecha)}</p>
                              {data.averagePrice ? (
                                <p className="flex justify-between gap-4">
                                  <span className="text-gray-400">Precio:</span> 
                                  <span className="font-bold text-emerald-400">{formatCurrency(data.averagePrice)}/kg</span>
                                </p>
                              ) : null}
                              {data.prediction ? (
                                <p className="flex justify-between gap-4">
                                  <span className="text-gray-400">Predicción:</span> 
                                  <span className="font-bold text-purple-400">{formatCurrency(data.prediction)}/kg</span>
                                </p>
                              ) : null}
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={{ stroke: 'rgba(156, 163, 175, 0.4)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="averagePrice" stroke={color} fillOpacity={1} fill={`url(#color-${item.productoNombre.replace(/\s+/g, '-')})`} strokeWidth={2} yAxisId="left" />
                    <Area type="monotone" dataKey="prediction" stroke="#A855F7" fillOpacity={1} fill={`url(#color-pred-${item.productoNombre.replace(/\s+/g, '-')})`} strokeWidth={2} strokeDasharray="3 3" yAxisId="left" connectNulls />
                    <YAxis yAxisId="left" domain={['dataMin', 'dataMax']} hide />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </UiCard>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <UiCard className="w-full max-w-4xl h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-100 bg-white gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Historial: {selectedProduct.productoNombre}</h2>
                <p className="text-sm font-medium text-gray-500">Volumen y Precio · {formatLongDate(selectedProduct.latestDate)}</p>
              </div>
              
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Link 
                  href={`/dashboard/historial?producto=${encodeURIComponent(selectedProduct.productoNombre)}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  <ExternalLink size={16} strokeWidth={2.5} />
                  Ver historial completo
                </Link>
                
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 bg-white w-full h-full min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <ComposedChart data={selectedProduct.series.slice(-14)} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis dataKey="fecha" tickFormatter={(v) => new Date(v).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })} stroke="#9CA3AF" fontSize={12} tickMargin={10} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `S/ ${v}`} stroke="#10B981" fontSize={12} tickMargin={10} domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => v >= 1000 ? `${Math.round(v/1000)}k` : `${v}`} stroke="#F59E0B" fontSize={12} tickMargin={10} domain={[0, 'auto']} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl shadow-xl text-[13px] font-medium border border-gray-100 z-50">
                            <p className="font-bold text-gray-900 mb-2">{formatLongDate(data.fecha)}</p>
                            <p className="flex justify-between gap-6 mb-1">
                              <span className="text-gray-500">Precio prom:</span> 
                              <span className="font-bold text-emerald-600">{formatCurrency(data.averagePrice)}/kg</span>
                            </p>
                            {data.prediction && (
                              <p className="flex justify-between gap-6 mb-1">
                                <span className="text-purple-500">Predicción:</span> 
                                <span className="font-bold text-purple-600">{formatCurrency(data.prediction)}/kg</span>
                              </p>
                            )}
                            <p className="flex justify-between gap-6 border-t border-gray-50 pt-2 mt-2">
                              {data.predictedVolumeTon ? (
                                <>
                                  <span className="text-purple-500">Volumen Estimado:</span> 
                                  <span className="font-bold text-purple-600">{Math.round(data.predictedVolumeTon).toLocaleString()} Toneladas</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-500">Volumen Ingresado:</span> 
                                  <span className="font-bold text-amber-600">{Math.round(data.totalVolumeTon).toLocaleString()} Toneladas</span>
                                </>
                              )}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#374151' }} />
                  <Bar dataKey="totalVolumeTon" name="Volumen (Ton)" fill="#FDE68A" radius={[4, 4, 0, 0]} yAxisId="right" />
                  <Bar dataKey="predictedVolumeTon" name="Volumen Estimado" fill="#DDD6FE" radius={[4, 4, 0, 0]} yAxisId="right" />
                  <Line type="monotone" dataKey="averagePrice" name="Precio Promedio" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} yAxisId="left" />
                  <Line type="monotone" dataKey="prediction" name="Predicción IA" stroke="#A855F7" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2 }} yAxisId="left" connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </UiCard>
        </div>
      )}
    </section>
    </>
  );
}
