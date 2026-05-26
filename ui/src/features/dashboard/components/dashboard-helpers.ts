import type { HomeShowcaseResponse } from "../../showcase/types";
import { Cloud, CloudRain, Sun } from "lucide-react";
import React from "react";

export function formatLongDate(value: string): string {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const day = parts[2];
  const months = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
  const monthStr = months[monthNum - 1] || "";
  return `${day} ${monthStr} ${year}`;
}

export function formatCompactNumber(value: number | string): string {
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 }).format(toNumber(value));
}

export function formatMoneyCompact(value: number | string): string {
  const amount = toNumber(value);
  if (amount >= 1000) return `S/${Math.round(amount / 1000)}k`;
  return formatCurrency(amount);
}

export function formatCurrency(value: number | string): string {
  return `S/ ${toNumber(value).toFixed(2)}`;
}

export function formatPercent(value: number | string): string {
  return `${toNumber(value).toFixed(1)}%`;
}

export function formatSignedPercent(value: number | string): string {
  const amount = toNumber(value);
  return `${amount > 0 ? "+" : ""}${formatPercent(amount)}`;
}

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export function riskBadgeClassName(riskLevel: HomeShowcaseResponse["featuredCampaigns"][number]["riskLevel"]): string {
  return `shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
    riskLevel === "medium" ? "bg-amber-50/80 text-amber-700" : riskLevel === "high" ? "bg-red-50/80 text-red-700" : "bg-emerald-50/80 text-emerald-700"
  }`;
}

export function riskDotClassName(riskLevel: HomeShowcaseResponse["featuredCampaigns"][number]["riskLevel"]): string {
  return riskLevel === "medium" ? "bg-amber-500" : riskLevel === "high" ? "bg-red-500" : "bg-emerald-500";
}

export function progressClassName(riskLevel: HomeShowcaseResponse["featuredCampaigns"][number]["riskLevel"]): string {
  return riskLevel === "medium" ? "bg-[#E8751A]" : riskLevel === "high" ? "bg-red-500" : "bg-emerald-500";
}

export function deltaTextClassName(direction: "up" | "down" | "none"): string {
  return direction === "down" ? "text-red-500" : direction === "up" ? "text-emerald-500" : "text-gray-400";
}

export function renderWeatherIcon(conditionCode: HomeShowcaseResponse["weatherForecast"][number]["conditionCode"]) {
  if (conditionCode === "rain") {
    return React.createElement(CloudRain, { size: 20, strokeWidth: 2, className: "text-blue-500 mb-1" });
  }
  if (conditionCode === "cloud") {
    return React.createElement(Cloud, { size: 20, strokeWidth: 2, className: "text-gray-400 mb-1" });
  }
  return React.createElement(Sun, { size: 20, strokeWidth: 2, className: "text-amber-500 mb-1" });
}
