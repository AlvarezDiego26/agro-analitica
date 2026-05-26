"use client";

import { toast } from "sonner";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { usePlanificador } from "../hooks/use-planificador";
import { PlannerAlternatives } from "./planner-alternatives";
import { PlannerChart } from "./planner-chart";
import { PlannerForm } from "./planner-form";
import { PlannerResultBanner } from "./planner-result-banner";
import { createCampaign } from "../services/create-campaign";

import { useRouter } from "next/navigation";
import { views } from "../../../config/views";

export function DesktopPlannerScreen() {
  const router = useRouter();
  const {
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
    setContainerRef,
    handleAnalyzeCampaign
  } = usePlanificador();

  const handleSaveCampaign = async () => {
    if (!analysis?.input?.producto) return;
    
    try {
      await createCampaign({
        cropName: analysis.input.producto,
        sowingDate: analysis.input.fechaSiembra ?? new Date().toISOString(),
        hectares: analysis.input.hectareas ?? 1,
        marketType: (analysis.input.tipoMercado as "local" | "exportacion" | "industrial") ?? "local",
        campaignStatus: "draft",
        estimatedRoiPct: result?.estimatedRoi ?? null,
        estimatedInvestmentPen: analysis.input.inversionPen ?? null,
        plannerRiskLevel: result?.riskLevel ?? "low"
      });
      toast.success("Campaña guardada exitosamente en tus borradores.");
      router.push(views.home);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la campaña.");
    }
  };

  return (
    <DashboardShell
      title="Planificador Inteligente"
      subtitle="Analisis de campana - Asistido por IA"
      activeTab="planificar"
      showHeaderActions
      bodyClassName="flex flex-col gap-5 pb-6"
    >
      {!mounted ? (
        <div className="flex min-h-[400px] flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="flex h-full flex-row items-start gap-6">
          <PlannerForm
            form={form}
            updateForm={updateForm}
            isSubmitting={isSubmitting}
            handleAnalyzeCampaign={handleAnalyzeCampaign}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-4 border-l border-gray-200 pl-6">
            {analysis && result ? (
              <>
                <PlannerResultBanner analysis={analysis} result={result} />

                {analysis.input.producto ? (
                  <>
                    <UiCard className="flex flex-col overflow-hidden border-gray-200 p-0 shadow-sm">
                      <PlannerChart
                        analysis={analysis}
                        chart={chart}
                        dimensions={dimensions}
                        setContainerRef={setContainerRef}
                        hoveredIndex={hoveredIndex}
                        setHoveredIndex={setHoveredIndex}
                        isSubmitting={isSubmitting}
                        startPoint={startPoint}
                        endPoint={endPoint}
                      />
                    </UiCard>
                    
                    {/* Barra de Acciones */}
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm print-hidden">
                      <button 
                        onClick={handleSaveCampaign}
                        className="w-full sm:w-auto bg-[#1B2533] text-white px-6 py-3.5 rounded-xl text-[14px] font-bold hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        Guardar como nueva campaña
                      </button>
                      <button 
                        onClick={() => {
                          window.print();
                        }}
                        className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl text-[14px] font-bold hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        Exportar reporte PDF
                      </button>
                      <button 
                        onClick={() => toast.success("En desarrollo: Conexión con el mercado pronto disponible.")}
                        className="w-full sm:w-auto bg-emerald-600 text-white px-6 py-3.5 rounded-xl text-[14px] font-bold hover:bg-emerald-500 transition-colors shadow-sm sm:ml-auto"
                      >
                        Publicar alternativa en mercado
                      </button>
                    </div>
                  </>
                ) : null}

                <PlannerAlternatives alternatives={alternatives} updateForm={updateForm} />
              </>
            ) : (
              <UiCard className="border-dashed border-gray-300 bg-white/90 p-8 shadow-sm">
                <h3 className="text-[20px] font-black tracking-tight text-gray-900">Analisis pendiente</h3>
                <p className="mt-2 text-[14px] font-medium text-gray-500">
                  Selecciona una region, un cultivo y presiona <strong className="text-gray-900">Analizar campana</strong> para consultar el backend.
                </p>
                <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-[13px] text-gray-600">
                  Sin backend activo no se mostraran resultados, curvas ni alternativas recomendadas.
                </div>
              </UiCard>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
