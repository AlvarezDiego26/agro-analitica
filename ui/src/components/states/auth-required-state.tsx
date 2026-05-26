"use client";

import { LockKeyhole, Sprout, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardShell } from "../shell/dashboard-shell";
import { UiCard } from "../ui/ui-card";
import { views } from "../../config/views";

type AuthRequiredStateProps = {
  title: string;
  subtitle: string;
  activeTab: "inicio" | "planificar" | "mercado" | "mi-finca" | "perfil";
  message: string;
};

export function AuthRequiredState({ title, subtitle, activeTab, message }: Readonly<AuthRequiredStateProps>) {
  const pathname = usePathname();
  const loginHref = `${views.login}?next=${encodeURIComponent(pathname)}`;

  return (
    <DashboardShell title={title} subtitle={subtitle} activeTab={activeTab} bodyClassName="pb-8">
      <UiCard className="mx-auto max-w-3xl p-8 md:p-10 border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.9),rgba(255,255,255,1))]">
        <div className="flex flex-col gap-6 text-center items-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <LockKeyhole size={28} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-emerald-700">Cuenta requerida</p>
            <h2 className="text-[28px] font-black tracking-tight text-gray-900">Registra tu cuenta para activar esta seccion</h2>
            <p className="text-[15px] leading-7 text-gray-600 max-w-2xl">{message}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full text-left">
            {[
              "Registra tu primera finca y parcelas.",
              "Guarda campañas, seguimientos y decisiones.",
              "Recibe recomendaciones segun tus propios datos."
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4 text-[14px] font-medium text-gray-700">
                <div className="flex items-start gap-3">
                  <Sprout size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={loginHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#208843] px-5 py-3 text-[14px] font-bold text-white shadow-sm hover:bg-[#156E3F] transition-colors"
            >
              <UserPlus size={16} />
              Crear cuenta o iniciar sesion
            </Link>
            <Link
              href={views.market}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Seguir explorando
            </Link>
          </div>
        </div>
      </UiCard>
    </DashboardShell>
  );
}
