import { WifiOff } from "lucide-react";
import { DashboardShell } from "../shell/dashboard-shell";
import { UiCard } from "../ui/ui-card";

type BackendRequiredStateProps = Readonly<{
  title: string;
  subtitle: string;
  activeTab: "inicio" | "planificar" | "mercado" | "mi-finca" | "perfil";
  message: string;
}>;

export function BackendRequiredState({ title, subtitle, activeTab, message }: BackendRequiredStateProps) {
  return (
    <DashboardShell title={title} subtitle={subtitle} activeTab={activeTab} showHeaderActions bodyClassName="pb-6">
      <UiCard className="mx-auto mt-6 max-w-3xl border-dashed border-gray-300 bg-white/90 p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <WifiOff size={28} strokeWidth={2.5} />
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-900">Backend no disponible</h2>
        <p className="mt-2 text-sm font-medium text-gray-500">{message}</p>
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-600">
          <p className="font-bold text-gray-900">Que esperar cuando la API este encendida</p>
          <p className="mt-1">La pantalla volvera a cargar datos reales del backend y dejara de mostrar este estado vacio.</p>
        </div>
      </UiCard>
    </DashboardShell>
  );
}
