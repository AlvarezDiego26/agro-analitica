"use client";

import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { BadgeCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { views } from "../../../config/views";

export function MobileProfileScreen() {
  const settingsOptions = [
    {
      title: "Información Personal",
      subtitle: "Editar nombre, celular y correo"
    },
    {
      title: "Mis Parcelas",
      subtitle: "Ubicación satelital y hectáreas"
    },
    {
      title: "Configuración de Notificaciones",
      subtitle: "Alertas de precios e IA"
    },
    {
      title: "Seguridad y Contraseña",
      subtitle: "Cambiar tu clave de acceso"
    }
  ];

  return (
    <DashboardShell 
      title="Mi Perfil" 
      subtitle="Manuel Mendoza · Productor" 
      activeTab="perfil" 
      bodyClassName="flex flex-col gap-5 pb-6"
    >
      {/* Profile Card */}
      <UiCard className="p-5 shadow-sm border-gray-200">
        <div className="flex gap-4 items-center">
          <span className="shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-black text-[22px] shadow-sm">
            MM
          </span>
          <div className="pt-0.5">
            <h2 className="text-[18px] font-black text-gray-900 leading-none flex items-center gap-1.5">
              Manuel Mendoza
              <BadgeCheck size={18} strokeWidth={2.5} className="text-emerald-500" />
            </h2>
            <p className="text-[13px] font-medium text-gray-400 mt-2">
              Productor · Valle de Ica
            </p>
          </div>
        </div>
      </UiCard>

      {/* Settings List Card */}
      <UiCard className="p-0 shadow-sm border-gray-200 overflow-hidden">
        <div className="flex flex-col divide-y divide-gray-100">
          {settingsOptions.map((option) => (
            <button 
              key={option.title} 
              onClick={() => toast.info(`Abriendo configuración de: ${option.title}...`)}
              className="flex items-center justify-between p-4 hover:bg-gray-50/80 transition-colors w-full text-left"
              type="button"
            >
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-gray-900">{option.title}</span>
                <span className="text-[13px] font-medium text-gray-400 mt-0.5">{option.subtitle}</span>
              </div>
              <ChevronRight size={18} strokeWidth={2.5} className="text-gray-300" />
            </button>
          ))}
        </div>
      </UiCard>

      {/* Logout Button */}
      <a 
        href={views.login}
        className="w-full mt-2 py-4 rounded-xl border border-gray-200 bg-white text-[#D32F2F] font-bold text-[16px] shadow-sm hover:bg-red-50 transition-colors text-center block"
      >
        Cerrar sesión
      </a>
    </DashboardShell>
  );
}
