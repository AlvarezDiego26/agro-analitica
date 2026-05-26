"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../providers/auth-provider";
import { getPlannerAnalysis } from "../services/get-planner-analysis";
import type { PlannerAnalysis, PlannerProjectionPoint } from "../types";

type MarketType = "local" | "exportacion" | "industria";

export type PlannerFormState = {
  valle: string;
  producto: string;
  hectareas: string;
  fechaSiembra: string;
  fechaCosecha: string;
  tipoMercado: MarketType;
  inversionPen: string;
};

export type ChartPoint = {
  x: number;
  y: number;
  point: PlannerProjectionPoint;
};

const MONTH_TO_INDEX: Record<string, number> = {
  Ene: 0,
  Feb: 1,
  Mar: 2,
  Abr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Ago: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dic: 11
};

export type ChartGeometry = {
  axisLabels: string[];
  predictedPoints: ChartPoint[];
  historicalPoints: ChartPoint[];
  predictedLinePath: string;
  historicalLinePath: string;
  predictedAreaPath: string;
  historicalAreaPath: string;
  pastPredictedLinePath: string;
  futurePredictedLinePath: string;
  pastPredictedAreaPath: string;
  futurePredictedAreaPath: string;
  oversupplyLeft: number;
  oversupplyWidth: number;
  maxVolume: number;
  volumeScaleMax: number;
  volumeAreaPath: string;
  pastVolumeLinePath: string;
  futureVolumeLinePath: string;
  pastVolumeAreaPath: string;
  futureVolumeAreaPath: string;
};

const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const INITIAL_FORM: PlannerFormState = {
  valle: "Arequipa",
  producto: "",
  hectareas: "4.0",
  fechaSiembra: new Date().toISOString().split("T")[0],
  fechaCosecha: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  tipoMercado: "exportacion",
  inversionPen: ""
};


function getBezierPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  }

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const cp1x = current.x + (next.x - current.x) / 3;
    const cp2x = current.x + (2 * (next.x - current.x)) / 3;
    path += ` C ${cp1x.toFixed(1)} ${current.y.toFixed(1)}, ${cp2x.toFixed(1)} ${next.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }

  return path;
}

function getMonthStartDate(point: PlannerProjectionPoint) {
  return new Date(point.year, MONTH_TO_INDEX[point.month] ?? 0, 1);
}

function addMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function resolveProjectionMarker(dateStr: string, points: PlannerProjectionPoint[], chartPoints: ChartPoint[]): ChartPoint | null {
  if (!dateStr || points.length === 0 || chartPoints.length === 0) {
    return null;
  }

  const targetDate = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(targetDate.getTime())) {
    return null;
  }

  if (points.length === 1 || chartPoints.length === 1) {
    return chartPoints[0] ?? null;
  }

  const monthStarts = points.map(getMonthStartDate);

  if (targetDate.getTime() <= monthStarts[0].getTime()) {
    return chartPoints[0];
  }

  for (let index = 0; index < monthStarts.length; index += 1) {
    const currentStart = monthStarts[index];
    const nextStart = index + 1 < monthStarts.length ? monthStarts[index + 1] : addMonth(currentStart);

    if (targetDate.getTime() >= currentStart.getTime() && targetDate.getTime() < nextStart.getTime()) {
      const currentPoint = chartPoints[index];
      const nextPoint = chartPoints[Math.min(index + 1, chartPoints.length - 1)];
      const ratio = nextStart.getTime() === currentStart.getTime()
        ? 0
        : (targetDate.getTime() - currentStart.getTime()) / (nextStart.getTime() - currentStart.getTime());

      const predictedPrice = currentPoint.point.predictedPrice + (nextPoint.point.predictedPrice - currentPoint.point.predictedPrice) * ratio;
      const historicalBase = currentPoint.point.historicalPrice ?? currentPoint.point.predictedPrice;
      const nextHistoricalBase = nextPoint.point.historicalPrice ?? nextPoint.point.predictedPrice;
      const historicalPrice = historicalBase + (nextHistoricalBase - historicalBase) * ratio;
      const volumeBase = currentPoint.point.volumeTon ?? 0;
      const nextVolumeBase = nextPoint.point.volumeTon ?? 0;
      const volumeTon = volumeBase + (nextVolumeBase - volumeBase) * ratio;

      return {
        x: currentPoint.x + (nextPoint.x - currentPoint.x) * ratio,
        y: currentPoint.y + (nextPoint.y - currentPoint.y) * ratio,
        point: {
          ...currentPoint.point,
          predictedPrice: Number(predictedPrice.toFixed(2)),
          historicalPrice: Number(historicalPrice.toFixed(2)),
          volumeTon: Number(volumeTon.toFixed(2))
        }
      };
    }
  }

  return chartPoints[chartPoints.length - 1] ?? null;
}

function buildChartGeometry(points: PlannerProjectionPoint[], width: number, height: number): ChartGeometry {
  if (points.length === 0) {
    return {
      axisLabels: [],
      predictedPoints: [],
      historicalPoints: [],
      predictedLinePath: "",
      historicalLinePath: "",
      predictedAreaPath: "",
      historicalAreaPath: "",
      pastPredictedLinePath: "",
      futurePredictedLinePath: "",
      pastPredictedAreaPath: "",
      futurePredictedAreaPath: "",
      oversupplyLeft: 0,
      oversupplyWidth: 0,
      maxVolume: 0,
      volumeScaleMax: 0,
      volumeAreaPath: "",
      pastVolumeLinePath: "",
      futureVolumeLinePath: "",
      pastVolumeAreaPath: "",
      futureVolumeAreaPath: ""
    };
  }

  // Note: X-Axis labels are handled in the component directly

  const values = points.flatMap((point) => [point.predictedPrice, point.historicalPrice ?? point.predictedPrice]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const paddingX = 45;
  const paddingY = 20;
  const toX = (index: number) =>
    points.length <= 1 ? width / 2 : paddingX + (index / (points.length - 1)) * (width - 2 * paddingX);
  const toY = (value: number) => paddingY + ((max - value) / spread) * (height - 2 * paddingY);

  const predictedPoints = points.map((point, index) => ({
    x: toX(index),
    y: toY(point.predictedPrice),
    point
  }));
  const historicalPoints = points.map((point, index) => ({
    x: toX(index),
    y: toY(point.historicalPrice ?? point.predictedPrice),
    point
  }));

  const maxVolume = Math.max(...points.map((p) => p.volumeTon || 0));
  const volumeScaleMax = Math.max(10, Math.ceil(maxVolume * 1.2 / 10) * 10);
  
  const volumeMaxHeight = height - 30;
  const toVolumeY = (vol: number) => (height - 30) - (volumeScaleMax ? (vol / volumeScaleMax) * volumeMaxHeight : 0);
  
  const volumePoints = points.map((point, index) => ({
    x: toX(index),
    y: toVolumeY(point.volumeTon || 0),
    point
  }));

  const predictedLinePath = getBezierPath(predictedPoints);
  const historicalLinePath = getBezierPath(historicalPoints);
  const predictedAreaPath =
    predictedPoints.length > 0
      ? `${predictedLinePath} L ${predictedPoints[predictedPoints.length - 1].x.toFixed(1)} ${height} L ${predictedPoints[0].x.toFixed(1)} ${height} Z`
      : "";
  const historicalAreaPath =
    historicalPoints.length > 0
      ? `${historicalLinePath} L ${historicalPoints[historicalPoints.length - 1].x.toFixed(1)} ${height} L ${historicalPoints[0].x.toFixed(1)} ${height} Z`
      : "";

  const volumeLinePath = getBezierPath(volumePoints);
  const volumeAreaPath = volumePoints.length > 0
    ? `${volumeLinePath} L ${volumePoints[volumePoints.length - 1].x.toFixed(1)} ${height - 30} L ${volumePoints[0].x.toFixed(1)} ${height - 30} Z`
    : "";

  const pastVolumePoints = volumePoints.slice(0, 3);
  const futureVolumePoints = volumePoints.slice(2);
  const pastVolumeLinePath = pastVolumePoints.length > 0 ? getBezierPath(pastVolumePoints) : "";
  const futureVolumeLinePath = futureVolumePoints.length > 0 ? getBezierPath(futureVolumePoints) : "";
  
  const pastVolumeAreaPath = pastVolumePoints.length > 0
    ? `${pastVolumeLinePath} L ${pastVolumePoints[pastVolumePoints.length - 1].x.toFixed(1)} ${height - 30} L ${pastVolumePoints[0].x.toFixed(1)} ${height - 30} Z`
    : "";
  const futureVolumeAreaPath = futureVolumePoints.length > 0
    ? `${futureVolumeLinePath} L ${futureVolumePoints[futureVolumePoints.length - 1].x.toFixed(1)} ${height - 30} L ${futureVolumePoints[0].x.toFixed(1)} ${height - 30} Z`
    : "";

  const oversupplyIndexes = points.map((point, index) => (point.oversupplyZone ? index : -1)).filter((index) => index >= 0);
  let oversupplyLeft = 0;
  let oversupplyWidth = 0;
  if (oversupplyIndexes.length > 0) {
    const firstIndex = oversupplyIndexes[0];
    const lastIndex = oversupplyIndexes[oversupplyIndexes.length - 1];
    oversupplyLeft = toX(firstIndex);
    oversupplyWidth = Math.max(2, toX(lastIndex) - toX(firstIndex));
  }

  const axisLabels = [max, max - spread * 0.25, max - spread * 0.5, max - spread * 0.75, min].map(
    (value) => `S/ ${value.toFixed(1)}`
  );
  const pastPredictedPoints = predictedPoints.slice(0, 3);
  const futurePredictedPoints = predictedPoints.slice(2);
  
  const pastPredictedLinePath = pastPredictedPoints.length > 0 ? getBezierPath(pastPredictedPoints) : "";
  const futurePredictedLinePath = futurePredictedPoints.length > 0 ? getBezierPath(futurePredictedPoints) : "";

  const pastPredictedAreaPath =
    pastPredictedPoints.length > 0
      ? `${pastPredictedLinePath} L ${pastPredictedPoints[pastPredictedPoints.length - 1].x.toFixed(1)} ${height} L ${pastPredictedPoints[0].x.toFixed(1)} ${height} Z`
      : "";
  
  const futurePredictedAreaPath =
    futurePredictedPoints.length > 0
      ? `${futurePredictedLinePath} L ${futurePredictedPoints[futurePredictedPoints.length - 1].x.toFixed(1)} ${height} L ${futurePredictedPoints[0].x.toFixed(1)} ${height} Z`
      : "";

  return {
    axisLabels,
    predictedPoints,
    historicalPoints,
    predictedLinePath,
    historicalLinePath,
    predictedAreaPath,
    historicalAreaPath,
    pastPredictedLinePath,
    futurePredictedLinePath,
    pastPredictedAreaPath,
    futurePredictedAreaPath,
    oversupplyLeft,
    oversupplyWidth,
    maxVolume,
    volumeScaleMax,
    volumeAreaPath,
    pastVolumeLinePath,
    futureVolumeLinePath,
    pastVolumeAreaPath,
    futureVolumeAreaPath
  };
}

export function formatShortDate(value: string): string {
  if (!value) {
    return "";
  }

  const parts = value.split("-");
  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;
  const monthLabel = MONTHS_ES[parseInt(month, 10) - 1] || "";
  return `${day} ${monthLabel}. ${year}`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "S/ 0.00";
  }

  return `S/ ${value.toFixed(2)}`;
}

export function formatSignedPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value}%`;
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Sin dato";
  }

  const sign = value > 0 ? "+" : "-";
  return `S/ ${sign}${Math.abs(value).toLocaleString("es-PE")}`;
}

export function formatProfit(estimatedRoi: number, hectareas: number): string {
  const profit = (estimatedRoi / 100) * hectareas * 17_500;
  return `S/ +${Math.round(profit).toLocaleString("es-PE")}`;
}

import { useSearchParams } from "next/navigation";

export function usePlanificador() {
  const { isAuthenticated, requireAuth } = useAuth();
  const searchParams = useSearchParams();
  const initialCrop = searchParams?.get("crop") ?? "";

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<PlannerFormState>({ ...INITIAL_FORM, producto: initialCrop });
  const [analysis, setAnalysis] = useState<PlannerAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 250 });
  const [chartContainer, setChartContainer] = useState<HTMLDivElement | null>(null);
  const hasLoadedInitialAnalysis = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!chartContainer) {
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) {
        return;
      }

      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    observer.observe(chartContainer);
    return () => observer.disconnect();
  }, [chartContainer]);

  const result = analysis?.result ?? null;
  const projection = result?.priceProjection ?? [];
  const alternatives = result?.recommendedAlternatives ?? [];

  const visibleProjection = useMemo(() => {
    if (projection.length === 0 || !form.fechaSiembra || !form.fechaCosecha) return projection;

    const [sY, sM] = form.fechaSiembra.split("-").map(Number);
    const siembraVal = sY * 12 + sM - 1;

    const [cY, cM] = form.fechaCosecha.split("-").map(Number);
    const cosechaVal = cY * 12 + cM - 1;

    // The backend projection starts 4 months before fechaSiembra
    const startVal = siembraVal - 4;

    const filtered = projection.filter((point, index) => {
      // We calculate the absolute month value sequentially
      const pointVal = startVal + index;
      
      // The user wants to see a bit of history, so let's show 2 months before siembra, up to 2 months after cosecha.
      return pointVal >= siembraVal - 2 && pointVal <= cosechaVal + 2;
    });

    return filtered.length > 2 ? filtered : projection;
  }, [projection, form.fechaSiembra, form.fechaCosecha]);

  const chart = useMemo(
    () => buildChartGeometry(visibleProjection, Math.max(100, dimensions.width - 96), dimensions.height),
    [visibleProjection, dimensions]
  );

  const { startPoint, endPoint } = useMemo(() => {
    if (!form.fechaSiembra || !form.fechaCosecha || visibleProjection.length === 0) {
      return { startPoint: null, endPoint: null };
    }

    return {
      startPoint: resolveProjectionMarker(form.fechaSiembra, visibleProjection, chart.predictedPoints),
      endPoint: resolveProjectionMarker(form.fechaCosecha, visibleProjection, chart.predictedPoints)
    };
  }, [chart.predictedPoints, visibleProjection, form.fechaSiembra, form.fechaCosecha]);

  const triggerAnalysis = useCallback(async (updatedForm: PlannerFormState, silent = false) => {
    const hectareas = Number(updatedForm.hectareas);
    
    // Validate required fields
    if (!updatedForm.valle || !updatedForm.producto || !updatedForm.fechaSiembra || !updatedForm.fechaCosecha || !updatedForm.hectareas) {
      if (!silent) toast.error("Por favor, completa todos los campos requeridos (Región, Cultivo, Hectáreas y Fechas).");
      return;
    }
    
    if (!Number.isFinite(hectareas) || hectareas <= 0) {
      if (!silent) toast.error("La cantidad de hectáreas debe ser un número válido y mayor a 0.");
      return;
    }

    setIsSubmitting(true);
    setHoveredIndex(null);

    try {
      const response = await getPlannerAnalysis({
        valle: updatedForm.valle,
        producto: updatedForm.producto,
        hectareas,
        fechaSiembra: updatedForm.fechaSiembra,
        fechaCosecha: updatedForm.fechaCosecha,
        tipoMercado: updatedForm.tipoMercado,
        inversionPen: updatedForm.inversionPen ? Number(updatedForm.inversionPen) : undefined
      });
      setAnalysis(response);
    } catch {
      setAnalysis(null);
      if (!silent) {
        toast.error("No se pudo consultar el backend.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedInitialAnalysis.current) {
      return;
    }

    hasLoadedInitialAnalysis.current = true;
    void triggerAnalysis(form, true);
  }, [triggerAnalysis, form]);

  const updateForm = useCallback(
    <K extends keyof PlannerFormState>(key: K, value: PlannerFormState[K]) => {
      const updated = { ...form, [key]: value };
      setForm(updated);

      if (!isAuthenticated) {
        return;
      }

      if (key === "producto" || key === "valle" || key === "tipoMercado" || updated.producto) {
        void triggerAnalysis(updated, false);
        return;
      }

      void triggerAnalysis(updated, true);
    },
    [form, triggerAnalysis]
  );

  const handleAnalyzeCampaign = useCallback(async () => {
    if (!isAuthenticated && !requireAuth("Registrate para ejecutar analisis de campana y guardar escenarios propios.")) {
      return;
    }

    const hectareas = Number(form.hectareas);
    if (!form.valle || !form.producto || !form.fechaSiembra || !Number.isFinite(hectareas) || hectareas <= 0) {
      toast.error("Completa region, cultivo, fecha y hectareas validas antes de analizar.");
      return;
    }

    setIsSubmitting(true);
    const inversionPenNum = form.inversionPen ? Number(form.inversionPen) : undefined;
    const promise = getPlannerAnalysis({ ...form, hectareas, fechaCosecha: form.fechaCosecha, inversionPen: inversionPenNum });

    toast.promise(promise, {
      loading: "Consultando backend y analizando campana...",
      success: "Analisis completado.",
      error: "No se pudo consultar el backend."
    });

    try {
      setAnalysis(await promise);
    } catch {
      setAnalysis(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, isAuthenticated, requireAuth]);

  return {
    mounted,
    form,
    analysis,
    result,
    projection,
    alternatives,
    isSubmitting,
    hoveredIndex,
    dimensions,
    chart,
    startPoint,
    endPoint,
    updateForm,
    setHoveredIndex,
    setContainerRef: setChartContainer,
    handleAnalyzeCampaign
  };
}
