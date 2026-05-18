"use client";

import type { ReactNode } from "react";
import { Bell, ChartColumn, Home, Search, Sprout, Store, UserRound, HelpCircle, Settings, LogOut, Plus, Leaf } from "lucide-react";
import { toast } from "sonner";
import { mobileNavigation } from "../../config/navigation";
import { views } from "../../config/views";

type DashboardShellProps = Readonly<{
  title: string;
  subtitle: string;
  activeTab: "inicio" | "planificar" | "mercado" | "mi-finca" | "perfil";
  showHeaderActions?: boolean;
  bodyClassName?: string;
  children: ReactNode;
}>;

export function DashboardShell({
  title,
  subtitle,
  activeTab,
  showHeaderActions = false,
  bodyClassName,
  children
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-0">
      <div className="w-full bg-white flex overflow-hidden relative min-h-screen">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 lg:w-[260px] bg-[#1B2533] text-gray-400 border-r border-gray-800 shrink-0">
          <div className="p-5 xl:p-6 flex flex-col gap-8 h-full">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#208843] rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Leaf size={22} strokeWidth={2.5} className="text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[17px] font-black text-white tracking-tight">AgroAnalítica</span>
                <span className="text-[11px] font-medium text-gray-500">Ica - v1.0</span>
              </div>
            </div>

            {/* Nav */}
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-3 px-2">Plataforma</p>
                <nav className="flex flex-col gap-1.5">
                  {mobileNavigation.map(item => {
                    const isActive = item.key === activeTab;
                    return (
                      <a 
                        key={item.key} 
                        href={item.href}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                          isActive 
                            ? "bg-[#208843] text-white shadow-sm" 
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {getNavIcon(item.key)}
                          <span className="text-[14px]">{item.label}</span>
                        </div>
                        {isActive && item.key === "planificar" && (
                          <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded text-white font-black">IA</span>
                        )}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Status Area */}
            <div className="flex flex-col gap-4">
              <div className="px-4 py-3.5 bg-[#111827]/60 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-2.5">Estado Regional - Ica</p>
                <ul className="flex flex-col gap-2 text-[12px] font-medium text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span> Espárrago: sobreoferta
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> Palta: demanda alta
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span> Uva: estable
                  </li>
                </ul>
              </div>

              {/* Extra links */}
              <nav className="flex flex-col gap-1 px-2 mt-1">
                <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Abriendo centro de ayuda...'); }} className="flex items-center gap-3 py-2 text-[13px] font-bold text-gray-400 hover:text-white transition-colors">
                  <HelpCircle size={18} strokeWidth={2.5} /> Ayuda
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Abriendo ajustes de plataforma...'); }} className="flex items-center gap-3 py-2 text-[13px] font-bold text-gray-400 hover:text-white transition-colors">
                  <Settings size={18} strokeWidth={2.5} /> Ajustes
                </a>
              </nav>

              {/* User profile */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 px-2 mt-1">
                <div className="flex items-center gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-[#16A34A] flex items-center justify-center text-white font-black text-sm shadow-inner">
                    MQ
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[13px] font-bold text-white">Manuel Quispe</span>
                    <span className="text-[11px] font-medium text-gray-500">Fundo San Juan</span>
                  </div>
                </div>
                <a href={views.login} className="text-gray-500 hover:text-white transition-colors block">
                  <LogOut size={16} strokeWidth={2.5} />
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#F4F6F8]">
          <main className="flex-1 overflow-y-auto pt-[max(env(safe-area-inset-top),20px)] px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 lg:mb-8 mt-2">
              <div>
                <p className="text-[12px] font-semibold text-gray-500 tracking-wide">{subtitle}</p>
                <h1 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-gray-900 mt-0.5">{title}</h1>
              </div>
              
              {showHeaderActions && (
                <div className="flex items-center gap-3">
                  {/* Search Bar Desktop */}
                  <div className="hidden lg:flex relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Buscar cultivo, parcela, comprador..." 
                      className="w-72 bg-white border border-gray-200 text-gray-900 text-[13px] rounded-xl pl-10 pr-3 py-2.5 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all" 
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                       <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">⌘K</span>
                    </div>
                  </div>

                  <button type="button" onClick={() => toast.success('No tienes notificaciones nuevas.')} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 transition-colors hidden md:flex" aria-label="Alertas">
                    <Bell size={18} strokeWidth={2.5} />
                  </button>

                  <button type="button" onClick={() => toast.info('Módulo de Nueva Campaña en construcción.')} className="hidden md:flex items-center gap-2 bg-[#1B2533] text-white px-4 py-2.5 rounded-xl font-bold text-[13px] shadow-sm hover:bg-gray-800 transition-colors">
                    <Plus size={16} strokeWidth={3} />
                    Nueva campaña
                  </button>
                  
                  {/* Mobile Actions */}
                  <div className="flex md:hidden gap-2">
                    <button type="button" onClick={() => toast.info('Activando búsqueda...')} className="w-10 h-10 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors" aria-label="Buscar">
                      <Search size={18} strokeWidth={2.5} />
                    </button>
                    <button type="button" onClick={() => toast.success('No tienes notificaciones nuevas.')} className="w-10 h-10 flex items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors" aria-label="Alertas">
                      <Bell size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}
            </header>

            <div className={bodyClassName}>
              {children}
            </div>
          </main>

          {/* Bottom Nav (Mobile) */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 grid grid-cols-5 gap-1 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),16px)] border-t border-gray-200 bg-white/95 backdrop-blur-xl z-50">
            {mobileNavigation.map(item => {
              const isActive = item.key === activeTab;
              return (
                <a 
                  key={item.key} 
                  href={item.href} 
                  className={`flex flex-col items-center gap-1 p-1 text-[11px] font-bold transition-colors ${
                    isActive ? "text-[#208843]" : "text-gray-400"
                  }`}
                >
                  <span className={`inline-flex p-1.5 rounded-xl transition-colors ${isActive ? "bg-emerald-50" : "bg-transparent"}`}>
                    {getNavIcon(item.key)}
                  </span>
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

      </div>
    </div>
  );
}

function getNavIcon(key: (typeof mobileNavigation)[number]["key"]) {
  switch (key) {
    case "inicio":
      return <Home size={18} strokeWidth={2.5} />;
    case "planificar":
      return <ChartColumn size={18} strokeWidth={2.5} />;
    case "mercado":
      return <Store size={18} strokeWidth={2.5} />;
    case "mi-finca":
      return <Sprout size={18} strokeWidth={2.5} />;
    case "perfil":
      return <UserRound size={18} strokeWidth={2.5} />;
    default:
      return <Home size={18} strokeWidth={2.5} />;
  }
}
