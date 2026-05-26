"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Leaf, BarChart3, Lock, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { views } from "../../../config/views";
import { useAuth } from "../../../providers/auth-provider";

type DesktopLoginScreenProps = {
  nextHref?: string;
  reason?: string;
};

export function DesktopLoginScreen({ nextHref, reason }: Readonly<DesktopLoginScreenProps>) {
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
    <div className="min-h-screen bg-white flex w-full">
      <div className="hidden lg:flex w-1/2 bg-[#1B2533] relative overflow-hidden flex-col justify-between p-16 xl:p-24">
        <img
          src="/login-bg-cornfield.jpg"
          alt="Agricultor de AgroAnalitica"
          className="absolute inset-0 w-full h-full object-cover object-[center_35%] transform -scale-x-100 z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2533]/85 via-[#1B2533]/45 to-[#208843]/20 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1B2533]/75 z-0"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#208843]/30 to-transparent opacity-40 z-0"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#208843] rounded-full blur-[120px] opacity-40 z-0"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-[#208843] rounded-2xl flex items-center justify-center shadow-lg shadow-[#208843]/30">
            <Leaf size={28} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white">AgroAnalitica</span>
        </div>

        <div className="relative z-10 mt-16 mb-auto max-w-lg">
          <h1 className="text-3xl xl:text-4.5xl font-black text-white leading-[1.2] tracking-tight mb-4">
            Mira el mercado primero,<br />
            <span className="text-[#208843]">activa tu cuenta cuando quieras interactuar.</span>
          </h1>
          <p className="text-sm xl:text-[15px] text-gray-300/90 font-medium leading-relaxed mb-8 max-w-md">
            AgroAnalitica te deja explorar precios, oportunidades y cultivos antes de registrarte. Cuando crees tu cuenta,
            podras guardar fincas, campanas y recomendaciones personalizadas.
          </p>

          <div className="flex flex-col gap-4.5">
            <Feature icon={BarChart3} title="Explora senales reales del mercado" description="Consulta precios, variaciones y oportunidades sin friccion." />
            <Feature icon={MapPin} title="Analiza por region y valle" description="Compara escenarios productivos antes de registrar tu finca." />
            <Feature icon={ShieldCheck} title="Activa tu espacio cuando estes listo" description="Campanas, parcelas y seguimientos aparecen al registrarte." />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-sm text-gray-500 font-medium">
          <span>© 2026 AgroAnalitica v1.0</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terminos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 bg-white relative">
        <div className="w-full max-w-[460px] flex flex-col">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">
              {isLogin ? "Inicia sesion" : "Crea tu cuenta"}
            </h2>
            <p className="mt-2 text-[15px] font-medium text-gray-500">
              {isLogin ? "¿Aun no tienes cuenta?" : "¿Ya tienes una cuenta?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-[#208843] hover:text-[#156E3F] transition-colors"
              >
                {isLogin ? "Registrate ahora" : "Inicia sesion"}
              </button>
            </p>
          </div>

          {reason ? (
            <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-[14px] text-amber-800">
              {reason}
            </div>
          ) : null}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {!isLogin ? (
              <Field label="Nombre completo" icon={UserRound}>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  placeholder="Ej. Manuel Quispe"
                  className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-[15px]"
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
                className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-[15px]"
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
                className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-[15px]"
              />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-sm text-[16px] font-bold text-white bg-[#208843] hover:bg-[#156E3F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all mt-2 disabled:opacity-70"
            >
              {isSubmitting ? "Procesando..." : isLogin ? "Iniciar sesion" : "Crear cuenta"}
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description
}: Readonly<{ icon: typeof BarChart3; title: string; description: string }>) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
        <Icon size={18} className="text-[#208843]" strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="text-white font-bold text-[14px] leading-tight">{title}</h4>
        <p className="text-gray-400 text-[12px] font-medium leading-normal mt-0.5">{description}</p>
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
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon size={18} className="text-gray-400" />
        </div>
        {children}
      </div>
    </div>
  );
}
