"use client";

import { useState } from "react";
import { Mail, Lock, ChevronRight, Leaf, BarChart3, ShieldCheck, MapPin } from "lucide-react";
import { toast } from "sonner";
import { views } from "../../../config/views";

export function DesktopLoginScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-white flex w-full">
      {/* Left Column (Branding - 50%) */}
      <div className="hidden lg:flex w-1/2 bg-[#1B2533] relative overflow-hidden flex-col justify-between p-16 xl:p-24">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#208843]/20 to-transparent opacity-50 z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#208843] rounded-full blur-[100px] opacity-40 z-0"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#208843] rounded-2xl flex items-center justify-center shadow-lg shadow-[#208843]/30">
            <Leaf size={28} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white">AgroAnalítica</span>
        </div>

        {/* Value Proposition */}
        <div className="relative z-10 mt-20 mb-auto max-w-xl">
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
            Toma el control<br/>de tu cosecha<br/>con <span className="text-[#208843]">datos reales.</span>
          </h1>
          <p className="text-lg text-gray-300 font-medium leading-relaxed mb-12 max-w-lg">
            Únete a la red de productores más inteligente. Monitorea precios en tiempo real, proyecta tu ROI y conecta directamente con compradores verificados en tu valle.
          </p>

          {/* Features List */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <BarChart3 size={20} className="text-[#208843]" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-white font-bold text-[15px]">Predicción de precios IA</h4>
                <p className="text-gray-400 text-[13px] font-medium mt-0.5">Evita sobreofertas y vende en el mejor momento.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <MapPin size={20} className="text-[#208843]" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-white font-bold text-[15px]">Data por valles</h4>
                <p className="text-gray-400 text-[13px] font-medium mt-0.5">Estadísticas precisas de Ica, Pisco, Chincha y más.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck size={20} className="text-[#208843]" strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-white font-bold text-[15px]">Compradores verificados</h4>
                <p className="text-gray-400 text-[13px] font-medium mt-0.5">Conecta con agroexportadoras de forma segura.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-sm text-gray-500 font-medium">
          <span>© 2026 AgroAnalítica v1.0</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </div>

      {/* Right Column (Form - 50%) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-white relative">
        <div className="w-full max-w-[440px] flex flex-col">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">
              {isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}
            </h2>
            <p className="mt-2 text-[15px] font-medium text-gray-500">
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-[#208843] hover:text-[#156E3F] transition-colors"
              >
                {isLogin ? "Regístrate ahora" : "Inicia sesión"}
              </button>
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5" action={views.home}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@correo.com"
                  className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-[15px]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[13px] font-bold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-[15px]"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between mt-1 mb-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#208843] focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-[13px] font-medium text-gray-600 cursor-pointer">
                    Recordarme
                  </label>
                </div>

                <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Te enviaremos un correo para restablecer tu contraseña.'); }} className="text-[13px] font-bold text-[#208843] hover:text-[#156E3F]">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-[16px] font-bold text-white bg-[#208843] hover:bg-[#156E3F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all mt-2"
            >
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="px-4 bg-white text-gray-400 font-medium uppercase tracking-widest">O continuar con</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                  loading: 'Conectando con Google...',
                  success: 'Inicio de sesión con Google simulado con éxito.',
                  error: 'Error al conectar con Google.',
                })}
                className="w-full inline-flex justify-center items-center gap-3 py-4 px-4 border border-gray-200 rounded-2xl shadow-sm bg-white text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fillRule="evenodd" clipRule="evenodd" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fillRule="evenodd" clipRule="evenodd" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fillRule="evenodd" clipRule="evenodd" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fillRule="evenodd" clipRule="evenodd" />
                </svg>
                Google
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
