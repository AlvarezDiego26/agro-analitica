"use client";

import { useState } from "react";
import { Mail, Lock, ChevronRight, Leaf } from "lucide-react";
import { toast } from "sonner";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";

export function MobileLoginScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* Brand Logo Simulado */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#208843] rounded-xl flex items-center justify-center shadow-sm">
            <Leaf size={24} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-emerald-900">AgroAnalítica</span>
        </div>
        
        <h2 className="mt-2 text-center text-[28px] font-black text-gray-900 tracking-tight leading-tight">
          {isLogin ? "Inicia sesión en tu cuenta" : "Crea tu cuenta de productor"}
        </h2>
        <p className="mt-2 text-center text-[15px] font-medium text-gray-500">
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <UiCard className="p-6 sm:p-8 shadow-xl shadow-gray-200/50 border-gray-100">
          <form className="space-y-5" action={views.home}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@correo.com"
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-[15px]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[13px] font-bold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-[15px]"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between mt-2">
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

                <div className="text-[13px]">
                  <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Te enviaremos un correo para restablecer tu contraseña.'); }} className="text-[13px] font-bold text-[#208843] hover:text-[#156E3F]">
                  ¿Olvidaste tu contraseña?
                </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-[16px] font-bold text-white bg-[#208843] hover:bg-[#156E3F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all mt-6"
              >
                {isLogin ? "Iniciar sesión" : "Crear cuenta"}
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-[13px]">
                <span className="px-3 bg-white text-gray-500 font-medium">O continuar con</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                  loading: 'Conectando con Google...',
                  success: 'Inicio de sesión con Google simulado con éxito.',
                  error: 'Error al conectar con Google.',
                })}
                className="w-full inline-flex justify-center items-center gap-3 py-3.5 px-4 border border-gray-200 rounded-2xl shadow-sm bg-white text-[15px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  );
}
