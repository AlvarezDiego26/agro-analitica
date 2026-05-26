import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { ChartGeometry, ChartPoint } from "../hooks/use-planificador";
import type { PlannerAnalysis } from "../types";
import { LegendLine } from "./planner-ui-helpers";

export type PlannerChartProps = {
  analysis: PlannerAnalysis | null;
  chart: ChartGeometry;
  dimensions: { width: number; height: number };
  setContainerRef: (element: HTMLDivElement | null) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  isSubmitting: boolean;
  startPoint: ChartPoint | null;
  endPoint: ChartPoint | null;
};

export function PlannerChart({
  analysis,
  chart,
  dimensions,
  setContainerRef,
  hoveredIndex,
  setHoveredIndex,
  isSubmitting,
  startPoint,
  endPoint
}: PlannerChartProps) {
  const [showPrice, setShowPrice] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const {
    predictedPoints,
    historicalLinePath,
    historicalAreaPath,
    pastPredictedLinePath,
    futurePredictedLinePath,
    pastPredictedAreaPath,
    futurePredictedAreaPath,
    axisLabels,
    maxVolume,
    volumeScaleMax,
    volumeAreaPath,
    pastVolumeLinePath,
    futureVolumeLinePath,
    pastVolumeAreaPath,
    futureVolumeAreaPath
  } = chart;

  if (!analysis?.input?.producto) {
    return null;
  }

  const volumeLabels = [volumeScaleMax, volumeScaleMax * 0.75, volumeScaleMax * 0.5, volumeScaleMax * 0.25, 0].map(v => Math.round(v));
  const markerLogic = getMarkerLogic(startPoint, endPoint);

  const showStartTooltip = Boolean(showPrice && startPoint && (!endPoint || startPoint.x !== endPoint.x));
  const showEndTooltip = Boolean(showPrice && endPoint);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-[16px] font-bold leading-tight text-gray-900">Proyección de precio y volumen</h3>
          <p className="mt-0.5 text-[12px] font-medium text-gray-400">
            {analysis.input.producto} - Referencia {analysis.input.valle}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <LegendLine label="Precio Reciente" className="border-solid border-emerald-500" />
            <LegendLine label="Predicción IA" className="border-dashed border-purple-500" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrice(!showPrice)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-bold transition-all ${showPrice ? "border-emerald-200 text-emerald-700 bg-white shadow-sm" : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100"}`}
            >
              {showPrice ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              Línea Precio
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-bold transition-all ${showVolume ? "border-amber-200 text-amber-700 bg-white shadow-sm" : "border-gray-200 text-gray-400 bg-gray-50 hover:bg-gray-100"}`}
            >
              {showVolume ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              Línea Volumen
            </button>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: dimensions.height }} ref={setContainerRef}>
        <div className="absolute bottom-6 left-12 right-12 top-0">
          {/* Left Y-Axis (Price) */}
          {showPrice && (
            <div className="absolute -left-12 bottom-0 top-0 flex w-10 flex-col justify-between pb-6 text-right text-[12px] font-medium text-gray-400">
              {axisLabels.map((label, index) => (
                <span key={`y-axis-${index}`}>{label}</span>
              ))}
            </div>
          )}

          {/* Right Y-Axis (Volume) */}
          {showVolume && (
            <div className="absolute -right-12 bottom-0 top-0 flex w-12 flex-col justify-between pb-6 border-l border-amber-200/50 pl-3 text-left text-[12px] font-medium text-amber-500/80">
              {volumeLabels.map((label, index) => (
                <span key={`v-axis-${index}`}>{label}</span>
              ))}
            </div>
          )}

          <div
            className="absolute inset-0 cursor-crosshair pb-6"
            onMouseMove={(event) => {
              if (predictedPoints.length === 0) {
                setHoveredIndex(null);
                return;
              }
              const rect = event.currentTarget.getBoundingClientRect();
              const relativeX = event.clientX - rect.left;
              let closestIndex = 0;
              let minDiff = Infinity;
              predictedPoints.forEach((point, index) => {
                const diff = Math.abs(point.x - relativeX);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestIndex = index;
                }
              });
              setHoveredIndex(closestIndex);
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Grid Lines */}
            {(showPrice || showVolume) && (
              <>
                <div className="h-1/4 w-full border-t border-gray-100/70"></div>
                <div className="h-1/4 w-full border-t border-gray-100/70"></div>
                <div className="h-1/4 w-full border-t border-gray-100/70"></div>
                <div className="h-1/4 w-full border-t border-gray-100/70"></div>
              </>
            )}

            {/* Cosecha Area (Smart Box) */}
            {showPrice && startPoint && endPoint ? (
              <div
                className={`pointer-events-none absolute top-0 flex flex-col items-center border-l border-r border-dashed z-0 ${markerLogic.zoneClassName}`}
                style={{
                  left: `${Math.min(startPoint.x, endPoint.x)}px`,
                  width: `${Math.max(0, Math.abs(endPoint.x - startPoint.x))}px`,
                  bottom: "30px"
                }}
              >
                <span className={`absolute -top-7 whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/90 shadow-sm border ${markerLogic.zoneBadgeClassName}`}>
                  {markerLogic.zoneLabel}
                </span>
              </div>
            ) : null}

            {/* Hover Vertical Line */}
            {hoveredIndex !== null && predictedPoints[hoveredIndex] ? (
              <div
                className="pointer-events-none absolute top-0 z-10 border-l border-dashed border-emerald-500"
                style={{ left: `${predictedPoints[hoveredIndex].x}px`, bottom: "30px" }}
              />
            ) : null}

            {/* Hover Tooltip */}
            {hoveredIndex !== null && predictedPoints[hoveredIndex] ? (
              <Tooltip
                point={predictedPoints[hoveredIndex]}
                width={dimensions.width}
                isFuture={hoveredIndex >= 3}
              />
            ) : null}

            <svg
              width={dimensions.width}
              height={dimensions.height}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="pointer-events-none absolute inset-0 z-10 overflow-visible"
            >
              <defs>
                <linearGradient id="futureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="pastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="volFutureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="volPastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Volume Bars */}
              {showVolume && predictedPoints.map((point, index) => {
                const vol = point.point.volumeTon || 0;
                if (vol <= 0 || !volumeScaleMax) return null;
                
                const isFuture = index >= 3;
                const maxBarHeight = dimensions.height - 30;
                const barHeight = (vol / volumeScaleMax) * maxBarHeight;
                const barWidth = 14;
                const barX = point.x - barWidth / 2;
                const barY = (dimensions.height - 30) - barHeight;
                
                return (
                  <rect
                    key={`vol-bar-${index}`}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={isFuture ? "#A855F7" : "#F59E0B"}
                    rx={6}
                    className="transition-all duration-300"
                    opacity={hoveredIndex === index ? 0.7 : 0.35}
                  />
                );
              })}

              {/* Volume Area Paths */}
              {showVolume && pastVolumeAreaPath ? <path d={pastVolumeAreaPath} fill="url(#volPastGrad)" /> : null}
              {showVolume && futureVolumeAreaPath ? <path d={futureVolumeAreaPath} fill="url(#volFutureGrad)" /> : null}

              {/* Volume Line Paths */}
              {showVolume && pastVolumeLinePath ? (
                <path d={pastVolumeLinePath} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
              {showVolume && futureVolumeLinePath ? (
                <path d={futureVolumeLinePath} fill="none" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}

              {/* Volume Dots */}
              {showVolume && predictedPoints.map((point, index) => {
                const vol = point.point.volumeTon || 0;
                if (vol <= 0 || !volumeScaleMax) return null;
                const isFuture = index >= 3;
                const maxBarHeight = dimensions.height - 30;
                const barHeight = (vol / volumeScaleMax) * maxBarHeight;
                const barY = (dimensions.height - 30) - barHeight;
                
                return (
                  <circle
                    key={`vol-dot-${index}`}
                    cx={point.x}
                    cy={barY}
                    r="3.5"
                    fill="white"
                    stroke={isFuture ? "#A855F7" : "#F59E0B"}
                    strokeWidth="2"
                  />
                );
              })}

              {/* Bottom Base Line */}
              <line x1={0} y1={dimensions.height - 30} x2={dimensions.width} y2={dimensions.height - 30} stroke="#E5E7EB" strokeWidth="1" />

              {/* Price Area Paths */}
              {showPrice && pastPredictedAreaPath ? <path d={pastPredictedAreaPath} fill="url(#pastGrad)" /> : null}
              {showPrice && futurePredictedAreaPath ? <path d={futurePredictedAreaPath} fill="url(#futureGrad)" /> : null}
              
              {/* Price Line Paths */}
              {showPrice && pastPredictedLinePath ? (
                <path d={pastPredictedLinePath} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
              {showPrice && futurePredictedLinePath ? (
                <path d={futurePredictedLinePath} fill="none" stroke="#A855F7" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}

              {/* Price Dots (Recharts style) */}
              {showPrice && predictedPoints.map((point, index) => {
                const isFuture = index >= 3;
                return (
                  <circle
                    key={`price-dot-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    fill="white"
                    stroke={isFuture ? "#A855F7" : "#10B981"}
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {/* Intelligent Floating Tooltips (HTML absolute positioning) */}
            {showStartTooltip && startPoint ? (
              <div
                className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center transition-all duration-300 z-20"
                style={{ left: `${startPoint.x}px`, top: `${Math.max(0, Math.min(dimensions.height - 40, startPoint.y - 35))}px` }}
              >
                <div className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm ${markerLogic.startBadgeClassName}`}>
                  Siembra · S/ {startPoint.point.predictedPrice.toFixed(2)}
                </div>
                <div className={`h-3 w-px ${markerLogic.startLineClassName}`}></div>
              </div>
            ) : null}

            {showEndTooltip && endPoint ? (
              <div
                className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center transition-all duration-300 z-20"
                style={{ left: `${endPoint.x}px`, top: `${Math.max(0, Math.min(dimensions.height - 40, endPoint.y - 35))}px` }}
              >
                <div className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm ${markerLogic.endBadgeClassName}`}>
                  Cosecha · S/ {endPoint.point.predictedPrice.toFixed(2)} {markerLogic.endArrow}
                </div>
                <div className={`h-3 w-px ${markerLogic.endLineClassName}`}></div>
              </div>
            ) : null}
          </div>

          {/* X Axis labels */}
          <div className="absolute bottom-0 left-0 right-0 h-6">
            {predictedPoints.map((point, index) => (
              <div 
                key={`${point.point.month}-${index}`}
                className="absolute flex justify-center text-[13px] font-medium text-gray-500 w-16 -ml-8"
                style={{ left: `${point.x}px` }}
              >
                {point.point.month}
              </div>
            ))}
          </div>

          {isSubmitting ? (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg bg-white/70 backdrop-blur-[1px]">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600"></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Calculando...</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Tooltip({ point, width, isFuture }: { point: ChartPoint; width: number; isFuture: boolean }) {
  const tooltipTransform = point.x > width - 120 ? "translateX(-90%)" : point.x < 120 ? "translateX(-10%)" : "translateX(-50%)";

  return (
    <div
      className="pointer-events-none absolute z-30 transition-all duration-300"
      style={{
        left: `${point.x}px`,
        top: `${Math.max(20, point.y - 120)}px`,
        transform: tooltipTransform
      }}
    >
      <div className="flex flex-col gap-1.5 rounded-xl border border-gray-100 bg-white/95 p-2.5 shadow-xl backdrop-blur-sm min-w-[140px]">
        <p className="text-[12px] font-bold text-gray-800 border-b border-gray-100 pb-1.5">
          {point.point.month} {point.point.year}
        </p>
        
        <div className="space-y-1">
          <p className="flex justify-between gap-3 text-[11px]">
            <span className="font-medium text-gray-500">Precio Proy:</span>
            <span className={`font-bold ${isFuture ? 'text-purple-600' : 'text-emerald-600'}`}>
              S/ {point.point.predictedPrice?.toFixed(2)}
            </span>
          </p>
          {point.point.historicalPrice !== null && point.point.historicalPrice !== undefined && (
            <div className="flex justify-between gap-3 text-gray-500 text-[11px]">
              <span>Prom. mes:</span>
              <span>S/ {point.point.historicalPrice.toFixed(2)}</span>
            </div>
          )}
          {point.point.volumeTon !== null && point.point.volumeTon !== undefined && (
            <div className="flex justify-between gap-3 text-gray-500 pt-1 border-t border-gray-100/50 text-[11px]">
              <span>Vol. Est:</span>
              <span className="font-semibold text-gray-700">{Math.round(point.point.volumeTon)} t</span>
            </div>
          )}
        </div>

        {point.point.weeklyBreakdown && point.point.weeklyBreakdown.length > 0 && (
          <div className="mt-1.5 border-t border-gray-100 pt-1.5">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">Promedio Semanal</p>
            <div className="flex justify-between gap-1">
              {point.point.weeklyBreakdown.map((w, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 rounded bg-gray-50 px-1.5 py-1">
                  <span className="text-[9px] font-medium text-gray-500">S{i + 1}</span>
                  <span className="text-[10px] font-bold text-gray-700">{w.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getMarkerLogic(startPoint: ChartPoint | null, endPoint: ChartPoint | null) {
  if (!startPoint || !endPoint) {
    return {
      zoneLabel: "Ventana sin referencia",
      zoneClassName: "border-gray-300 bg-gray-50/40",
      zoneBadgeClassName: "border-gray-100 text-gray-500",
      startBadgeClassName: "bg-[#388E3C]",
      startLineClassName: "bg-[#388E3C]",
      endBadgeClassName: "bg-[#388E3C]",
      endLineClassName: "bg-[#388E3C]",
      endArrow: ""
    };
  }

  const startPrice = startPoint.point.predictedPrice;
  const endPrice = endPoint.point.predictedPrice;
  const diff = endPrice - startPrice;
  const tolerance = Math.max(0.03, startPrice * 0.03);

  if (diff > tolerance) {
    return {
      zoneLabel: "Ventana favorable",
      zoneClassName: "border-emerald-300 bg-emerald-50/50",
      zoneBadgeClassName: "border-emerald-100 text-emerald-600",
      startBadgeClassName: "bg-[#D32F2F]",
      startLineClassName: "bg-[#D32F2F]",
      endBadgeClassName: "bg-[#388E3C]",
      endLineClassName: "bg-[#388E3C]",
      endArrow: "↑"
    };
  }

  if (Math.abs(diff) <= tolerance) {
    return {
      zoneLabel: "Presion media",
      zoneClassName: "border-amber-300 bg-amber-50/50",
      zoneBadgeClassName: "border-amber-100 text-amber-600",
      startBadgeClassName: "bg-[#388E3C]",
      startLineClassName: "bg-[#388E3C]",
      endBadgeClassName: "bg-[#F59E0B]",
      endLineClassName: "bg-[#F59E0B]",
      endArrow: "→"
    };
  }

  return {
    zoneLabel: "Sobreoferta proyectada",
    zoneClassName: "border-red-300 bg-[#FCEAE8]/50",
    zoneBadgeClassName: "border-red-100 text-red-600",
    startBadgeClassName: "bg-[#388E3C]",
    startLineClassName: "bg-[#388E3C]",
    endBadgeClassName: "bg-[#D32F2F]",
    endLineClassName: "bg-[#D32F2F]",
    endArrow: "↓"
  };
}
