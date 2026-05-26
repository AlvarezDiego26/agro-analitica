import { Sprout } from "lucide-react";
import { UiCard } from "../../../components/ui/ui-card";
import { formatCurrency, formatSignedPercent } from "../hooks/use-planificador";
import type { PlannerFormState } from "../hooks/use-planificador";
import type { PlannerAlternative } from "../types";

export type PlannerAlternativesProps = {
  alternatives: PlannerAlternative[];
  updateForm: <K extends keyof PlannerFormState>(key: K, value: PlannerFormState[K]) => void;
};

export function PlannerAlternatives({ alternatives, updateForm }: PlannerAlternativesProps) {
  if (alternatives.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-3 mt-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold tracking-tight text-gray-900">Alternativas recomendadas</h3>
          <p className="text-[12px] font-medium text-gray-500">Cultivos con mejor ROI proyectado para tu region y ventana</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {alternatives.map((item) => (
          <UiCard
            key={item.producto}
            className={`flex h-36 cursor-pointer flex-col justify-between p-4 shadow-sm transition-all duration-200 ${
              item.riskLevel === "medium"
                ? "hover:border-amber-300 hover:bg-amber-50/10 hover:shadow-md"
                : "hover:border-emerald-300 hover:bg-emerald-50/10 hover:shadow-md"
            }`}
            onClick={() => updateForm("producto", item.producto)}
          >
            <div>
              <div className="mb-2 flex items-start justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                  <Sprout size={14} strokeWidth={2.5} />
                </span>
                <span className="text-[12px] font-black text-emerald-600">{formatSignedPercent(item.estimatedRoi)}</span>
              </div>
              <h4 className="text-[14px] font-bold leading-tight text-gray-900">{item.producto}</h4>
              <p className="mt-0.5 text-[11px] font-medium text-gray-500">{item.message}</p>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  item.riskLevel === "medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${item.riskLevel === "medium" ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                {item.riskLabel}
              </span>
              <strong className="text-[14px] font-black text-gray-900">
                {formatCurrency(item.projectedPricePen)}
                <span className="text-[10px] font-bold text-gray-400">/kg</span>
              </strong>
            </div>
          </UiCard>
        ))}
      </div>
    </div>
  );
}
