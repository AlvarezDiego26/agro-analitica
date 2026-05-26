"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ArrowLeft, CalendarDays, Eye, EyeOff } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, Bar, Legend } from "recharts";
import { useRouter } from "next/navigation";
import { UiCard } from "../../../components/ui/ui-card";
import { deltaTextClassName, formatCurrency, formatLongDate, formatPercent } from "./dashboard-helpers";
import type { DashboardOverviewResponse } from "../types";

export function MarketHistory({ productData }: { productData: DashboardOverviewResponse["marketCards"][0] }) {
  const router = useRouter();
  
  // Date range state
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  // Visibility toggles
  const [showPrice, setShowPrice] = React.useState<boolean>(true);
  const [showVolume, setShowVolume] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (!startDate && !endDate && productData.series.length > 0) {
      // Default to 1 month ago to now for a clean initial view
      const series = productData.series;
      const defaultStart = series.length > 30 ? series[series.length - 30].fecha : series[0].fecha;
      setStartDate(defaultStart);
      setEndDate(series[series.length - 1].fecha);
    }
  }, [startDate, endDate, productData.series]);

  const filteredSeries = React.useMemo(() => {
    return productData.series.filter(d => {
      if (startDate && d.fecha < startDate) return false;
      if (endDate && d.fecha > endDate) return false;
      return true;
    });
  }, [productData, startDate, endDate]);

  const aggregatedSeries = React.useMemo(() => {
    const days = filteredSeries.length;
    if (days <= 45) return filteredSeries; // Daily view keeps predictions as-is

    const isMonthly = days > 180;
    const grouped = new Map<string, any>();

    // Separate historical and prediction data
    const historicalOnly = filteredSeries.filter(item => item.averagePrice !== undefined);
    const predictionOnly = filteredSeries.filter(item => item.prediction !== undefined && item.averagePrice === undefined);

    for (const item of historicalOnly) {
      const d = new Date(item.fecha);
      d.setUTCHours(12);
      
      let key = "";
      if (isMonthly) {
        key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
      } else {
        const day = d.getUTCDay() || 7; 
        d.setUTCDate(d.getUTCDate() - day + 1);
        key = d.toISOString().split('T')[0];
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, { fecha: key, sumPrice: 0, countPrice: 0, sumVol: 0, countVol: 0 });
      }
      const g = grouped.get(key);
      
      g.sumPrice += item.averagePrice;
      g.countPrice++;
      
      if (item.totalVolumeTon !== undefined) {
        g.sumVol += item.totalVolumeTon;
        g.countVol++;
      }
    }

    const result = Array.from(grouped.values()).map(g => ({
      fecha: g.fecha,
      averagePrice: g.countPrice > 0 ? Number((g.sumPrice / g.countPrice).toFixed(2)) : undefined,
      totalVolumeTon: g.countVol > 0 ? Number((g.sumVol / g.countVol).toFixed(2)) : undefined,
      prediction: undefined as number | undefined,
      predictedVolumeTon: undefined as number | undefined,
      isAggregated: true,
      aggrType: isMonthly ? 'month' : 'week'
    }));

    // Anchor the prediction line to the very last historical point to avoid gaps
    if (result.length > 0 && predictionOnly.length > 0) {
      const lastHistorical = result[result.length - 1];
      lastHistorical.prediction = lastHistorical.averagePrice;
      lastHistorical.predictedVolumeTon = lastHistorical.totalVolumeTon;
    }

    // Append the exact 7 daily predictions without grouping them
    const dailyPreds = predictionOnly.map((p: any) => ({
      fecha: p.fecha,
      averagePrice: undefined,
      totalVolumeTon: undefined,
      prediction: p.prediction,
      predictedVolumeTon: p.predictedVolumeTon,
      isAggregated: false
    }));

    return [...result, ...dailyPreds];
  }, [filteredSeries]);

  const isUp = productData.deltaDirection !== "down";
  const color = isUp ? "#10B981" : "#EF4444";
  const showDots = aggregatedSeries.length <= 60;

  // Limits
  const maxAllowedDateStr = React.useMemo(() => {
    if (!productData.latestDate) return "";
    const d = new Date(productData.latestDate);
    d.setUTCHours(12);
    d.setUTCDate(d.getUTCDate() + 7); // Allow viewing the 7-day prediction
    return d.toISOString().split('T')[0];
  }, [productData.latestDate]);

  const minAllowedDateStr = React.useMemo(() => {
    if (!productData.latestDate) return "";
    const d = new Date(productData.latestDate);
    d.setUTCHours(12);
    // Allow up to 2 full years back to accommodate e.g. Jan 2025 when in mid 2026
    d.setUTCFullYear(d.getUTCFullYear() - 2);
    return d.toISOString().split('T')[0];
  }, [productData.latestDate]);

  // Ensure dates are valid and logical
  React.useEffect(() => {
    if (startDate && startDate < minAllowedDateStr) setStartDate(minAllowedDateStr);
    if (endDate && endDate > maxAllowedDateStr) setEndDate(maxAllowedDateStr);
    
    // Auto-correct if user accidentally selects a start date after the end date
    if (startDate && endDate && startDate > endDate) {
      // Just swap them visually or set start to a bit before end
      setStartDate(endDate);
    }
  }, [minAllowedDateStr, maxAllowedDateStr, startDate, endDate]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.push("/")}
          className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm transition-all hover:bg-gray-50"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Historial de Mercado: {productData.productoNombre}
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Análisis de precios y volumen · Actualizado al {formatLongDate(productData.latestDate)}
          </p>
        </div>
      </div>

      <UiCard className="w-full flex flex-col overflow-hidden p-6 gap-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-gray-100 pb-5">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-500">Precio Actual</span>
            <div className="flex items-baseline gap-3 mt-1">
              <strong className="text-3xl font-black text-gray-900 tracking-tight">
                {formatCurrency(productData.latestPrice)}
                <span className="text-lg font-bold text-gray-400 ml-1">/kg</span>
              </strong>
              <span className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-md ${
                isUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {productData.deltaDirection === "up" ? <ArrowUp size={16} strokeWidth={3} /> : productData.deltaDirection === "down" ? <ArrowDown size={16} strokeWidth={3} /> : null}
                {formatPercent(productData.deltaPct)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-stretch lg:self-auto">
            {/* Visibility Toggles */}
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <button 
                onClick={() => setShowPrice(!showPrice)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${showPrice ? 'bg-white text-emerald-700 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                title="Ocultar/Mostrar línea de tendencia del precio"
              >
                {showPrice ? <Eye size={16} /> : <EyeOff size={16} />}
                Línea Precio
              </button>
              <button 
                onClick={() => setShowVolume(!showVolume)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${showVolume ? 'bg-white text-amber-600 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                title="Ocultar/Mostrar línea de tendencia del volumen"
              >
                {showVolume ? <Eye size={16} /> : <EyeOff size={16} />}
                Línea Volumen
              </button>
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-3 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 flex-1 sm:flex-none">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-gray-500 uppercase">Desde</span>
                <input 
                  type="date" 
                  value={startDate}
                  min={minAllowedDateStr}
                  max={maxAllowedDateStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-gray-500 uppercase">Hasta</span>
                <input 
                  type="date" 
                  value={endDate}
                  min={minAllowedDateStr}
                  max={maxAllowedDateStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-[500px] min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <ComposedChart data={aggregatedSeries as any[]} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <defs>
                <linearGradient id={`history-color`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="fecha" 
                tickFormatter={(v) => {
                  const d = new Date(v);
                  d.setUTCHours(12);
                  if (filteredSeries.length > 180) return d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
                  return d.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
                }} 
                stroke="#9CA3AF" 
                fontSize={12} 
                tickMargin={12} 
              />
              
              <YAxis yAxisId="left" tickFormatter={(v) => `S/ ${v}`} stroke="#10B981" fontSize={12} tickMargin={12} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => v >= 1000 ? `${Math.round(v/1000)}k` : `${v}`} stroke="#F59E0B" fontSize={12} tickMargin={12} domain={[0, 'auto']} />
              
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const d = new Date(data.fecha);
                    d.setUTCHours(12);
                    let dateLabel = formatLongDate(data.fecha);
                    if (data.isAggregated) {
                      dateLabel = data.aggrType === 'month' 
                        ? `Promedio de ${d.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}`
                        : `Promedio Semana del ${d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`;
                    }

                    return (
                      <div className="bg-white p-4 rounded-xl shadow-xl text-[13px] font-medium border border-gray-100 z-50 min-w-[200px]">
                        <p className="font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">{dateLabel}</p>
                        <div className="flex flex-col gap-2">
                          {data.averagePrice !== undefined && (
                            <p className="flex justify-between gap-6">
                              <span className="text-gray-500">Precio prom:</span> 
                              <span className="font-bold text-emerald-600">{formatCurrency(data.averagePrice)}/kg</span>
                            </p>
                          )}
                          {data.prediction && (
                            <p className="flex justify-between gap-6">
                              <span className="text-purple-500">Predicción:</span> 
                              <span className="font-bold text-purple-600">{formatCurrency(data.prediction)}/kg</span>
                            </p>
                          )}
                          <div className="pt-2 mt-1 border-t border-gray-50">
                            <p className="flex justify-between gap-6">
                              {data.predictedVolumeTon ? (
                                <>
                                  <span className="text-purple-500">Vol. Estimado:</span> 
                                  <span className="font-bold text-purple-600">{Math.round(data.predictedVolumeTon).toLocaleString()} Ton</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-500">{data.isAggregated ? 'Volumen Medio/Día:' : 'Volumen Real:'}</span> 
                                  <span className="font-bold text-amber-600">{Math.round(data.totalVolumeTon).toLocaleString()} Ton</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
              />
              <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#374151' }} />
              
              <Bar dataKey="totalVolumeTon" name="Volumen Real (Ton)" fill="#FDE68A" radius={[4, 4, 0, 0]} yAxisId="right" maxBarSize={40} />
              <Bar dataKey="predictedVolumeTon" name="Volumen Estimado (Ton)" fill="#DDD6FE" radius={[4, 4, 0, 0]} yAxisId="right" maxBarSize={40} />
              
              <Area type="monotone" dataKey="averagePrice" legendType="none" fill="url(#history-color)" stroke="none" yAxisId="left" />
              
              {showVolume && <Line type="monotone" dataKey="totalVolumeTon" legendType="none" stroke="#F59E0B" strokeWidth={2} dot={showDots ? { r: 2, strokeWidth: 2 } : false} activeDot={showDots ? { r: 4 } : { r: 0 }} yAxisId="right" />}
              {showVolume && <Line type="monotone" dataKey="predictedVolumeTon" legendType="none" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" dot={showDots ? { r: 2, strokeWidth: 2 } : false} yAxisId="right" connectNulls />}
              
              {showPrice && <Line type="monotone" dataKey="averagePrice" name="Precio Promedio" stroke={color} strokeWidth={3} dot={showDots ? { r: 3, strokeWidth: 2 } : false} activeDot={showDots ? { r: 6 } : { r: 0 }} yAxisId="left" />}
              {showPrice && <Line type="monotone" dataKey="prediction" name="Predicción IA" stroke="#A855F7" strokeWidth={3} strokeDasharray="5 5" dot={showDots ? { r: 3, strokeWidth: 2 } : false} yAxisId="left" connectNulls />}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </UiCard>
    </div>
  );
}
