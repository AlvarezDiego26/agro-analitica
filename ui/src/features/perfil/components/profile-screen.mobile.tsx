"use client";

import { BadgeCheck, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { useAuth } from "../../../providers/auth-provider";

export function MobileProfileScreen() {
  const { currentUser, logout } = useAuth();
  const fullName = currentUser?.profile.fullName ?? "Productor local";
  const email = currentUser?.email ?? "Cuenta local";

  const settingsOptions = [
    {
      title: "Informacion personal",
      subtitle: "Editar nombre, celular y correo"
    },
    {
      title: "Mis parcelas",
      subtitle: "Ubicacion satelital y hectareas"
    },
    {
      title: "Configuracion de notificaciones",
      subtitle: "Alertas de precios e IA"
    },
    {
      title: "Seguridad y contrasena",
      subtitle: "Cambiar tu clave de acceso"
    }
  ];

  return (
    <DashboardShell title="Mi Perfil" subtitle={`${fullName} · Sesion activa`} activeTab="perfil" bodyClassName="flex flex-col gap-5 pb-6">
      <UiCard className="p-5 shadow-sm border-gray-200">
        <div className="flex gap-4 items-center">
          <span className="shrink-0 w-16 h-16 flex items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-black text-[22px] shadow-sm">
            {getInitials(fullName)}
          </span>
          <div className="pt-0.5">
            <h2 className="text-[18px] font-black text-gray-900 leading-none flex items-center gap-1.5">
              {fullName}
              <BadgeCheck size={18} strokeWidth={2.5} className="text-emerald-500" />
            </h2>
            <p className="text-[13px] font-medium text-gray-400 mt-2">{email}</p>
          </div>
        </div>
      </UiCard>

      <UiCard className="p-0 shadow-sm border-gray-200 overflow-hidden">
        <div className="flex flex-col divide-y divide-gray-100">
          {settingsOptions.map((option) => (
            <button
              key={option.title}
              onClick={() => toast.info(`Abriendo configuracion de: ${option.title}...`)}
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

      <button
        type="button"
        onClick={logout}
        className="w-full mt-2 py-4 rounded-xl border border-gray-200 bg-white text-[#D32F2F] font-bold text-[16px] shadow-sm hover:bg-red-50 transition-colors text-center block"
      >
        Cerrar sesion
      </button>
    </DashboardShell>
  );
}

function getInitials(fullName?: string) {
  if (!fullName) return "AG";
  const [first = "", second = ""] = fullName.split(" ");
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
