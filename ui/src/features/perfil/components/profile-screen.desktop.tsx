"use client";

import { Award, BadgeCheck, Bell, CreditCard, Globe, HelpCircle, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { useAuth } from "../../../providers/auth-provider";

export function DesktopProfileScreen() {
  const { currentUser, logout } = useAuth();
  const fullName = currentUser?.profile.fullName ?? "Productor local";
  const email = currentUser?.email ?? "correo local";

  const settingsOptions = [
    {
      title: "Mi cuenta",
      subtitle: `${fullName} · ${email}`,
      icon: User,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Notificaciones",
      subtitle: "Alertas regionales activadas",
      icon: Bell,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Certificaciones",
      subtitle: "GlobalG.A.P. · SENASA",
      icon: Award,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Metodos de pago",
      subtitle: "2 cuentas vinculadas",
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Idioma",
      subtitle: "Espanol · Peru",
      icon: Globe,
      color: "text-sky-600",
      bg: "bg-sky-50"
    },
    {
      title: "Ayuda y soporte",
      subtitle: "Centro de ayuda",
      icon: HelpCircle,
      color: "text-gray-600",
      bg: "bg-gray-100"
    }
  ];

  return (
    <DashboardShell
      title="Perfil de Usuario"
      subtitle="Configuracion y preferencias"
      activeTab="perfil"
      bodyClassName="flex flex-col gap-6 pb-8 h-full"
    >
      <div className="flex flex-row items-stretch gap-6 h-full w-full mt-2">
        <div className="w-[350px] shrink-0 flex flex-col gap-4">
          <UiCard className="p-8 flex flex-col items-center justify-center text-center shadow-sm border-gray-200 h-full relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#16A34A]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 shrink-0 w-32 h-32 rounded-full bg-[#16A34A] flex items-center justify-center text-white font-black text-5xl shadow-xl shadow-[#16A34A]/20 mb-6 border-4 border-white">
              {getInitials(fullName)}
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-[24px] font-black text-gray-900 leading-tight">{fullName}</h2>
              <p className="text-[14px] font-medium text-gray-500 mt-1 mb-4">{email}</p>

              <div className="flex items-center gap-2 bg-[#F0FDF4] px-4 py-2 rounded-full border border-emerald-100">
                <BadgeCheck size={18} strokeWidth={2.5} className="text-[#16A34A]" />
                <span className="text-[13px] font-bold text-[#16A34A]">Productor verificado</span>
              </div>
            </div>

            <div className="mt-auto pt-10 w-full relative z-10">
              <button
                type="button"
                onClick={logout}
                className="w-full py-4 rounded-xl border-2 border-red-100 bg-white text-[#D32F2F] font-bold text-[15px] shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} strokeWidth={2.5} />
                Cerrar sesion de forma segura
              </button>
            </div>
          </UiCard>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <UiCard className="p-6 shadow-sm border-gray-200 h-full flex flex-col">
            <h3 className="text-[18px] font-bold tracking-tight text-gray-900 mb-6">Panel de Control</h3>

            <div className="grid grid-cols-2 gap-4 flex-1">
              {settingsOptions.map((option) => (
                <button
                  key={option.title}
                  onClick={() => toast.info(`Abriendo configuracion de: ${option.title}...`)}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50/50 transition-all text-left group h-full"
                  type="button"
                >
                  <div className={`shrink-0 w-12 h-12 rounded-xl ${option.bg} ${option.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <option.icon size={22} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col mt-0.5">
                    <span className="text-[15px] font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{option.title}</span>
                    <span className="text-[13px] font-medium text-gray-500 mt-1">{option.subtitle}</span>
                  </div>
                </button>
              ))}
            </div>
          </UiCard>
        </div>
      </div>
    </DashboardShell>
  );
}

function getInitials(fullName?: string) {
  if (!fullName) return "AG";
  const [first = "", second = ""] = fullName.split(" ");
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
