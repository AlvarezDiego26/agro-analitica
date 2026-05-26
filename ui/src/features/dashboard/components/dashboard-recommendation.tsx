import { Sparkles } from "lucide-react";
import type { HomeShowcaseResponse } from "../../showcase/types";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";
import { formatSignedPercent } from "./dashboard-helpers";

export function DashboardRecommendation({ 
  recommendation 
}: Readonly<{ 
  recommendation: HomeShowcaseResponse["summary"]["recommendation"];
}>) {
  return (
    <UiCard className="col-span-1 flex flex-col justify-between shadow-xl overflow-hidden relative bg-[#13614B] border-transparent p-6 mt-1">
      <div className="relative z-10 h-full flex flex-col">
        <p className="text-[10px] font-black tracking-widest uppercase text-emerald-300 flex items-center gap-1.5 mb-4">
          <Sparkles size={12} strokeWidth={2.5} />
          AGROANALITICA - IA
        </p>
        <p className="text-[10px] font-black tracking-widest uppercase text-emerald-100 mb-1">
          RECOMENDACION DEL DIA
        </p>
        <h3 className="text-[17px] leading-snug font-bold mb-4 text-white">{recommendation.title}</h3>

        <div className="flex gap-4 mb-4">
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase text-emerald-200 mb-1">ROI PROYECTADO</p>
            <strong className="text-[20px] font-black text-white">{formatSignedPercent(recommendation.roiPct)}</strong>
          </div>
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase text-emerald-200 mb-1">RIESGO</p>
            <strong className="text-[20px] font-black text-white">{recommendation.riskLabel}</strong>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-emerald-50 font-medium opacity-90 mb-6">
          {recommendation.message}
        </p>

        <div className="mt-auto">
          <a href={views.planner} className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-[#13614B] font-bold shadow-sm">
            Abrir Planificador &gt;
          </a>
        </div>
      </div>
    </UiCard>
  );
}
