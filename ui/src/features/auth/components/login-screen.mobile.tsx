"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Leaf, Lock, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";
import { useAuth } from "../../../providers/auth-provider";

type MobileLoginScreenProps = {
  nextHref?: string;
  reason?: string;
};

export function MobileLoginScreen({ nextHref, reason }: Readonly<MobileLoginScreenProps>) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectHref = nextHref || views.home;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = isLogin
      ? await login({ email, password })
      : await register({ email, password, fullName });

    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(isLogin ? "Sesion iniciada correctamente." : "Cuenta creada correctamente.");
    router.push(redirectHref);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#208843] rounded-xl flex items-center justify-center shadow-sm">
            <Leaf size={24} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-emerald-900">AgroAnalitica</span>
        </div>

        <h2 className="mt-2 text-center text-[28px] font-black text-gray-900 tracking-tight leading-tight">
          {isLogin ? "Inicia sesion" : "Crea tu cuenta"}
        </h2>
        <p className="mt-2 text-center text-[15px] font-medium text-gray-500">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-[#208843] hover:text-[#156E3F] transition-colors"
          >
            {isLogin ? "Registrate ahora" : "Inicia sesion"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <UiCard className="p-6 sm:p-8 shadow-xl shadow-gray-200/50 border-gray-100">
          {reason ? (
            <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
              {reason}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin ? (
              <Field label="Nombre completo" icon={UserRound}>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  placeholder="Ej. Manuel Quispe"
                  className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-[15px]"
                />
              </Field>
            ) : null}

            <Field label="Correo electronico" icon={Mail}>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
                className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-[15px]"
              />
            </Field>

            <Field label="Contrasena" icon={Lock}>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={6}
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-2xl bg-gray-50/50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all sm:text-[15px]"
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-[16px] font-bold text-white bg-[#208843] hover:bg-[#156E3F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all mt-6 disabled:opacity-70"
            >
              {isSubmitting ? "Procesando..." : isLogin ? "Iniciar sesion" : "Crear cuenta"}
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </form>
        </UiCard>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children
}: Readonly<{ label: string; icon: typeof Mail; children: ReactNode }>) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon size={18} className="text-gray-400" />
        </div>
        {children}
      </div>
    </div>
  );
}
