import type { HomeShowcaseResponse } from "../../showcase/types";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";

export function DashboardTasks({ 
  upcomingTasks,
  hasActiveCampaigns
}: Readonly<{ 
  upcomingTasks: HomeShowcaseResponse["upcomingTasks"];
  hasActiveCampaigns: boolean;
}>) {
  return (
    <section className="col-span-1 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1 mt-1">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight text-gray-900">Tareas próximas</h3>
          <p className="text-[12px] font-medium text-gray-400">
            {hasActiveCampaigns ? `Esta semana · ${upcomingTasks.length} pendientes` : "Sin tareas programadas"}
          </p>
        </div>
      </div>

      <UiCard className="p-5 shadow-sm border-gray-200 h-full flex flex-col">
        {!hasActiveCampaigns ? (
          <div className="flex flex-col items-center justify-center flex-1 py-6 text-center">
            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <span className="text-gray-300">📅</span>
            </div>
            <p className="text-[13px] font-medium text-gray-400 px-4">
              Añade una campaña para ver tus tareas
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4 flex-1">
            {upcomingTasks.map((task) => (
              <li key={`${task.title}-${task.scheduleLabel}`} className="flex gap-3 items-start">
                <span className={`w-2 h-2 rounded-full ${task.severity === "high" ? "bg-red-500" : task.severity === "medium" ? "bg-amber-500" : "bg-emerald-500"} mt-1.5 shrink-0`}></span>
                <div>
                  <h4 className="text-[13px] font-bold text-gray-900 leading-tight">{task.title}</h4>
                  <p className="text-[11px] font-medium text-gray-500">{task.scheduleLabel}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <a href={views.planner} className="text-[13px] font-bold text-[#208843] hover:text-[#156E3F] transition-colors mt-4">
          {hasActiveCampaigns ? "Ver calendario >" : "Planificar campaña >"}
        </a>
      </UiCard>
    </section>
  );
}
