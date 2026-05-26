"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { MapPinned, Plus, Sprout, Waves, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { AuthRequiredState } from "../../../components/states/auth-required-state";
import { DashboardShell } from "../../../components/shell/dashboard-shell";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";
import { useAuth } from "../../../providers/auth-provider";
import { createFarm } from "../services/create-farm";
import { updateFarm } from "../services/update-farm";
import { deleteFarm } from "../services/delete-farm";
import { getCurrentUserFarms } from "../services/get-current-user-farms";
import type { UserFarm } from "../types";

type FarmFormState = {
  id?: string;
  farmName: string;
  regionCode: string;
  provinceName: string;
  districtName: string;
  locationLabel: string;
  totalHectares: string;
  waterSource: string;
};

const INITIAL_FORM: FarmFormState = {
  id: undefined,
  farmName: "",
  regionCode: "",
  provinceName: "",
  districtName: "",
  locationLabel: "",
  totalHectares: "",
  waterSource: ""
};

export function FarmScreen() {
  const { isReady, isAuthenticated, currentUser, refreshAuth } = useAuth();
  const [farms, setFarms] = useState<UserFarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FarmFormState>(INITIAL_FORM);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadFarms() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const result = await getCurrentUserFarms();
        if (!isMounted) return;
        setFarms(result.farms);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : "No se pudieron cargar tus predios.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFarms();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isReady]);

  const totalHectares = useMemo(() => farms.reduce((sum, farm) => sum + farm.totalHectares, 0), [farms]);
  const firstName = currentUser?.profile.fullName.split(" ")[0] ?? "productor";

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredState
        title="Mi Finca"
        subtitle="Gestión predial"
        activeTab="mi-finca"
        message="Tus predios y parcelas solo aparecen cuando tengas una cuenta. Regístrate y carga tus hectáreas para personalizar el seguimiento."
      />
    );
  }

  async function handleDelete(farmId: string) {
    if (!window.confirm("¿Seguro que deseas eliminar este predio? Esta acción no se puede deshacer.")) return;
    try {
      setIsSubmitting(true);
      await deleteFarm(farmId);
      setFarms((current) => current.filter((f) => f.id !== farmId));
      if (form.id === farmId) setForm(INITIAL_FORM);
      toast.success("Predio eliminado exitosamente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar el predio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(farm: UserFarm) {
    setForm({
      id: farm.id,
      farmName: farm.farmName,
      regionCode: farm.regionCode,
      provinceName: farm.provinceName ?? "",
      districtName: farm.districtName ?? "",
      locationLabel: farm.locationLabel ?? "",
      totalHectares: String(farm.totalHectares),
      waterSource: farm.waterSource ?? ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hectares = Number(form.totalHectares);

    if (!form.farmName.trim() || !form.regionCode.trim() || !Number.isFinite(hectares) || hectares <= 0) {
      toast.error("Completa nombre, región y hectáreas para registrar el predio.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        farmName: form.farmName.trim(),
        regionCode: form.regionCode.trim(),
        provinceName: form.provinceName.trim() || null,
        districtName: form.districtName.trim() || null,
        locationLabel: form.locationLabel.trim() || null,
        totalHectares: hectares,
        waterSource: form.waterSource.trim() || null
      };

      if (form.id) {
        const result = await updateFarm(form.id, payload);
        setFarms((current) => current.map((f) => (f.id === form.id ? result.farm : f)));
        toast.success("Predio actualizado exitosamente.");
      } else {
        const result = await createFarm(payload);
        setFarms((current) => [result.farm, ...current]);
        toast.success("Tu predio ya quedó registrado.");
      }

      setForm(INITIAL_FORM);
      await refreshAuth();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardShell
      title="Mis Predios"
      subtitle={farms.length ? `${farms[0].farmName} · ${formatCompact(totalHectares)} ha registradas` : "Registra tu primer predio"}
      activeTab="mi-finca"
      showHeaderActions
      bodyClassName="flex flex-col gap-6 pb-8"
    >
      <UiCard className="p-6 md:p-8 border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(255,255,255,1))]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="max-w-4xl">
            <p className="text-[11px] font-black tracking-[0.24em] uppercase text-emerald-700">Tus Predios Reales</p>
            <h2 className="text-[28px] font-black tracking-tight text-gray-900 mt-2">
              {farms.length ? `${firstName}, aquí administras tus fincas y chacras` : `${firstName}, empecemos registrando tu primera parcela o chacra`}
            </h2>
            <p className="text-[15px] leading-7 text-gray-600 mt-3">
              {farms.length
                ? "Las hectáreas y ubicaciones que ves aquí son tus datos reales."
                : "Todavía no tienes predios cargados. Sin importar si tienes 2 hectáreas o 200, regístralo aquí para personalizar tus recomendaciones."}
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-white px-5 py-4 shadow-sm min-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MapPinned size={22} />
              </div>
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">Estado actual</p>
                <p className="text-[15px] font-bold text-gray-900 mt-1">
                  {farms.length ? `${farms.length} predio${farms.length === 1 ? "" : "s"} registrado${farms.length === 1 ? "" : "s"}` : "Sin predios registrados aún"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr,1.35fr] gap-6">
        <UiCard className="p-6 border-gray-200 shadow-sm relative">
          {form.id && (
            <button 
              onClick={() => setForm(INITIAL_FORM)}
              className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-800 transition-colors"
              title="Cancelar edición"
            >
              <X size={16} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              {form.id ? <Pencil size={22} /> : <Plus size={22} />}
            </div>
            <div>
              <h3 className="text-[20px] font-black tracking-tight text-gray-900">
                {form.id ? "Editar predio" : "Registrar predio"}
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {form.id ? "Actualiza los datos de tu finca o chacra." : "Añade una nueva finca o chacra al sistema."}
              </p>
            </div>
          </div>

          <form className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-400">Nombre de la finca/chacra</span>
              <input
                value={form.farmName}
                onChange={(event) => setForm((current) => ({ ...current, farmName: event.target.value }))}
                className="h-12 rounded-xl border border-gray-200 px-4 text-[14px] font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                placeholder="Ej. Chacra Los Pinos"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-400">Región</span>
              <input
                value={form.regionCode}
                onChange={(event) => setForm((current) => ({ ...current, regionCode: event.target.value }))}
                className="h-12 rounded-xl border border-gray-200 px-4 text-[14px] font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                placeholder="Ej. Ica"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-400">Hectáreas totales</span>
              <input
                value={form.totalHectares}
                onChange={(event) => setForm((current) => ({ ...current, totalHectares: event.target.value }))}
                className="h-12 rounded-xl border border-gray-200 px-4 text-[14px] font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                placeholder="Ej. 2.5"
                inputMode="decimal"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-400">Provincia</span>
              <input
                value={form.provinceName}
                onChange={(event) => setForm((current) => ({ ...current, provinceName: event.target.value }))}
                className="h-12 rounded-xl border border-gray-200 px-4 text-[14px] font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                placeholder="Ej. Pisco"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-400">Distrito</span>
              <input
                value={form.districtName}
                onChange={(event) => setForm((current) => ({ ...current, districtName: event.target.value }))}
                className="h-12 rounded-xl border border-gray-200 px-4 text-[14px] font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                placeholder="Ej. San Clemente"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-400">Ubicación visible</span>
              <input
                value={form.locationLabel}
                onChange={(event) => setForm((current) => ({ ...current, locationLabel: event.target.value }))}
                className="h-12 rounded-xl border border-gray-200 px-4 text-[14px] font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                placeholder="Ej. Sector 3"
              />
            </label>
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="text-[12px] font-black uppercase tracking-[0.18em] text-gray-400">Fuente de agua</span>
              <input
                value={form.waterSource}
                onChange={(event) => setForm((current) => ({ ...current, waterSource: event.target.value }))}
                className="h-12 rounded-xl border border-gray-200 px-4 text-[14px] font-medium text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                placeholder="Ej. Canal de riego"
              />
            </label>

            <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
              <p className="text-[13px] leading-6 text-gray-500">
                {form.id ? "Actualiza los datos y presiona Guardar." : "Con esto ya podemos dejar de mostrarte sugerencias generales y empezar a personalizar tu app."}
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-[#1B2533] px-5 py-3 text-[14px] font-bold text-white hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? "Guardando..." : form.id ? "Actualizar predio" : "Registrar predio"}
              </button>
            </div>
          </form>
        </UiCard>

        <UiCard className="p-6 border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Sprout size={22} />
            </div>
            <div>
              <h3 className="text-[20px] font-black tracking-tight text-gray-900">Tus Predios (Fincas / Chacras)</h3>
              <p className="text-[13px] text-gray-500 mt-1">Tus propiedades registradas en la plataforma.</p>
            </div>
          </div>

          {isLoading ? (
            <p className="mt-5 text-[14px] text-gray-500">Cargando predios...</p>
          ) : errorMessage ? (
            <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-[14px] text-rose-700">
              {errorMessage}
            </div>
          ) : farms.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
              <p className="text-[16px] font-bold text-gray-900">Todavía no hay predios registrados</p>
              <p className="text-[14px] leading-6 text-gray-500 mt-2">
                Usa el formulario de la izquierda para crear el primero.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {farms.map((farm) => (
                <div key={farm.id} className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div>
                      <p className="text-[18px] font-black tracking-tight text-gray-900">{farm.farmName}</p>
                      <p className="text-[14px] text-gray-500 mt-1">{buildLocation(farm)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleEdit(farm)} className="p-2 text-gray-400 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100" title="Editar">
                         <Pencil size={18} />
                       </button>
                       <button onClick={() => handleDelete(farm.id)} disabled={isSubmitting} className="p-2 text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 disabled:opacity-50" title="Eliminar">
                         <Trash2 size={18} />
                       </button>
                       <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 border border-emerald-100 ml-2">
                         <Waves size={16} />
                         <span className="text-[13px] font-bold">{farm.waterSource ?? "Sin registrar"}</span>
                       </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Hectáreas</p>
                      <p className="text-[20px] font-black text-gray-900 mt-1">{formatCompact(farm.totalHectares)} ha</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Región</p>
                      <p className="text-[16px] font-bold text-gray-900 mt-1">{farm.regionCode}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">Creada</p>
                      <p className="text-[16px] font-bold text-gray-900 mt-1">{formatDate(farm.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </UiCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <UiCard className="p-6 border-gray-200 shadow-sm">
          <p className="text-[11px] font-black tracking-[0.22em] uppercase text-emerald-700">Lo que cambia cuando registres tu predio</p>
          <div className="mt-4 space-y-3 text-[14px] text-gray-700">
            {[
              "El home deja de tratarte como usuario nuevo y empieza a leer tu contexto real.",
              "Luego podremos conectar parcelas, cultivos y campañas a esta base operativa.",
              "Tus recomendaciones podrán cruzar tus hectáreas con señales del mercado."
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Sprout size={16} className="text-emerald-700 shrink-0 mt-1" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </UiCard>

        <UiCard className="p-6 border-gray-200 shadow-sm">
          <p className="text-[11px] font-black tracking-[0.22em] uppercase text-amber-600">Siguiente paso real</p>
          <div className="mt-4 space-y-3 text-[14px] text-gray-700">
            {[
              "Primero registra la chacra/finca y valida que aparezca en la lista de la derecha.",
              "Después te conviene usar el planificador para simular campañas con tu criterio actual.",
              "Más adelante conectaremos parcelas y campañas reales en esta misma base."
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <MapPinned size={16} className="text-amber-600 shrink-0 mt-1" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Link
            href={views.planner}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#1B2533] px-4 py-3 text-[14px] font-bold text-white hover:bg-gray-800 transition-colors"
          >
            Ir al planificador
          </Link>
        </UiCard>
      </div>
    </DashboardShell>
  );
}

function buildLocation(farm: UserFarm) {
  return [farm.locationLabel, farm.districtName, farm.provinceName, farm.regionCode].filter(Boolean).join(" · ");
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
