"use client";

import { useMemo, useState } from "react";
import type { MarketplaceTab, SupplyFilter, SupplyItem } from "../types";

const supplyItems: SupplyItem[] = [
  {
    id: "urea-46",
    category: "Fertilizantes",
    title: "Urea 46%",
    supplier: "Yara Peru",
    presentation: "saco 50 kg",
    regionLabel: "Ica y sierra centro",
    updatedLabel: "Actualizado hoy 08:30 a. m.",
    recommendedCrop: "Recomendado para papa en crecimiento",
    useCase: "Refuerzo nitrogenado en etapa vegetativa",
    pricePen: 128,
    marketLowPen: 120,
    marketHighPen: 146,
    signalLabel: "Precio conveniente",
    signalDescription: "Se mueve 4% por debajo del promedio semanal en distribuidores comparables.",
    tone: "good"
  },
  {
    id: "sulfato-potasio",
    category: "Fertilizantes",
    title: "Sulfato de potasio",
    supplier: "Misti S.A.",
    presentation: "saco 50 kg",
    regionLabel: "Costa sur",
    updatedLabel: "Actualizado hace 4 horas",
    recommendedCrop: "Util para papa y cebolla",
    useCase: "Mejora llenado, firmeza y respuesta en suelos salinos",
    pricePen: 142,
    marketLowPen: 138,
    marketHighPen: 156,
    signalLabel: "Precio estable",
    signalDescription: "Se mantiene dentro del rango normal del mes sin presion de alza.",
    tone: "neutral"
  },
  {
    id: "algamin",
    category: "Bioestimulantes",
    title: "Bioestimulante foliar Algamin",
    supplier: "Silvestre",
    presentation: "litro",
    regionLabel: "Valles interandinos",
    updatedLabel: "Actualizado ayer",
    recommendedCrop: "Bueno para papa en estres",
    useCase: "Apoyo foliar en recuperacion por frio o trasplante",
    pricePen: 96,
    marketLowPen: 88,
    marketHighPen: 101,
    signalLabel: "Buen rango",
    signalDescription: "Precio alineado con oferta reciente y buena disponibilidad regional.",
    tone: "good"
  },
  {
    id: "cipermetrina",
    category: "Plaguicidas",
    title: "Insecticida Cipermetrina 25%",
    supplier: "Farmex",
    presentation: "litro",
    regionLabel: "Mercado mayorista Lima",
    updatedLabel: "Actualizado hoy 10:10 a. m.",
    recommendedCrop: "Referencia para control preventivo",
    useCase: "Comparar costo de control contra brotes en papa y hortalizas",
    pricePen: 58,
    marketLowPen: 49,
    marketHighPen: 55,
    signalLabel: "Por encima del promedio",
    signalDescription: "Cotiza por encima del rango reciente; conviene comparar proveedor antes de comprar.",
    tone: "warn"
  },
  {
    id: "semilla-papa-canchan",
    category: "Semillas",
    title: "Semilla certificada de papa Canchan",
    supplier: "Red de semilleros Junin",
    presentation: "bolsa 25 kg",
    regionLabel: "Junin y Huancavelica",
    updatedLabel: "Actualizado hoy 07:15 a. m.",
    recommendedCrop: "Clave para campana de papa blanca",
    useCase: "Referencia para renovar semilla y mejorar uniformidad de lote",
    pricePen: 118,
    marketLowPen: 112,
    marketHighPen: 134,
    signalLabel: "Precio atractivo",
    signalDescription: "Buen nivel frente al rango regional y con semilla certificada disponible.",
    tone: "good"
  },
  {
    id: "cinta-goteo",
    category: "Riego",
    title: "Cinta de goteo 16 mm",
    supplier: "NaanDanJain",
    presentation: "rollo 500 m",
    regionLabel: "Ica",
    updatedLabel: "Actualizado hace 6 horas",
    recommendedCrop: "Riego eficiente para papa y cebolla",
    useCase: "Evaluar costo de tecnificacion para reducir perdida por riego",
    pricePen: 75,
    marketLowPen: 68,
    marketHighPen: 82,
    signalLabel: "Precio competitivo",
    signalDescription: "Se ubica en la parte baja del rango para rollos equivalentes.",
    tone: "good"
  },
  {
    id: "mancozeb",
    category: "Plaguicidas",
    title: "Fungicida Mancozeb",
    supplier: "Farmex",
    presentation: "kg",
    regionLabel: "Sierra sur",
    updatedLabel: "Actualizado ayer",
    recommendedCrop: "Uso frecuente en papa",
    useCase: "Referencia para manejo preventivo en epocas humedas",
    pricePen: 42,
    marketLowPen: 38,
    marketHighPen: 43,
    signalLabel: "Precio cercano al techo",
    signalDescription: "Conviene revisar una segunda oferta si no necesitas compra inmediata.",
    tone: "warn"
  },
  {
    id: "azada-liviana",
    category: "Herramientas",
    title: "Azada liviana mango reforzado",
    supplier: "Ferreagro Sur",
    presentation: "unidad",
    regionLabel: "Arequipa",
    updatedLabel: "Actualizado hace 2 dias",
    recommendedCrop: "Labores de mantenimiento en surco",
    useCase: "Comparar herramienta basica para cuadrillas pequenas",
    pricePen: 36,
    marketLowPen: 32,
    marketHighPen: 39,
    signalLabel: "Rango normal",
    signalDescription: "Sin cambios fuertes; buena referencia para compra operativa simple.",
    tone: "neutral"
  }
];

export function useMarketplaceView() {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("insumos");
  const [selectedSupplyFilter, setSelectedSupplyFilter] = useState<SupplyFilter>("Todos");

  const supplyFilters = useMemo<SupplyFilter[]>(
    () => ["Todos", "Fertilizantes", "Bioestimulantes", "Plaguicidas", "Semillas", "Riego", "Herramientas"],
    []
  );

  const filteredSupplyItems = useMemo(() => {
    if (selectedSupplyFilter === "Todos") {
      return supplyItems;
    }

    return supplyItems.filter((item) => item.category === selectedSupplyFilter);
  }, [selectedSupplyFilter]);

  return {
    activeTab,
    setActiveTab,
    supplyFilters,
    supplyItems,
    filteredSupplyItems,
    selectedSupplyFilter,
    setSelectedSupplyFilter
  };
}
