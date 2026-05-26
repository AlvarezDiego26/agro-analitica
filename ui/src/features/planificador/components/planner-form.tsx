import { useEffect, useRef, useState } from "react";
import { Calendar, CheckSquare, ChevronDown, Search, Sparkles } from "lucide-react";
import type { PlannerFormState } from "../hooks/use-planificador";

const valleOptions = [
  "Amazonas",
  "Ancash",
  "Apurimac",
  "Arequipa",
  "Ayacucho",
  "Cajamarca",
  "Callao",
  "Cusco",
  "Huancavelica",
  "Huanuco",
  "Ica",
  "Junin",
  "La Libertad",
  "Lambayeque",
  "Lima",
  "Loreto",
  "Madre de Dios",
  "Moquegua",
  "Pasco",
  "Piura",
  "Puno",
  "San Martin",
  "Tacna",
  "Tumbes",
  "Ucayali"
];

const cultivoOptions = [
  "Espárrago verde",
  "Palta Hass",
  "Uva Red Globe",
  "Cebolla amarilla",
  "Ajo",
  "Limón",
  "Arándano",
  "Mandarina",
  "Mango Kent",
  "Cebolla Roja",
  "Granada",
  "Ají Amarillo",
  "Papa Única",
  "Maíz Amarillo Duro",
  "Maracuyá",
  "Quinua",
  "Pimiento Piquillo",
  "Lúcuma"
] as const;

export type PlannerFormProps = {
  form: PlannerFormState;
  updateForm: <K extends keyof PlannerFormState>(key: K, value: PlannerFormState[K]) => void;
  isSubmitting: boolean;
  handleAnalyzeCampaign: () => void;
};

export function PlannerForm({ form, updateForm, isSubmitting, handleAnalyzeCampaign }: PlannerFormProps) {
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState(form.valle || "");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSearch, setCropSearch] = useState(form.producto || "");
  const regionRef = useRef<HTMLDivElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRegionSearch(form.valle || "");
  }, [form.valle]);

  useEffect(() => {
    setCropSearch(form.producto || "");
  }, [form.producto]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionOpen(false);
      }

      if (cropRef.current && !cropRef.current.contains(event.target as Node)) {
        setCropOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredValles = valleOptions.filter((valle) => valle.toLowerCase().includes(regionSearch.toLowerCase()));
  const filteredCultivos = cultivoOptions.filter((cultivo) => cultivo.toLowerCase().includes(cropSearch.toLowerCase()));

  return (
    <div className="w-[320px] shrink-0 sticky top-6 flex flex-col gap-4">
      <div>
        <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-emerald-600">Paso 1</p>
        <h2 className="mb-4 text-[18px] font-bold leading-tight text-gray-900">Parametros de campana</h2>
      </div>

      <div className="flex flex-col gap-6">
        <div ref={regionRef} className="relative">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Region</p>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} strokeWidth={2.5} />
            </span>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-[13px] font-semibold text-gray-800 shadow-sm transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Buscar region (ej. Arequipa)"
              value={regionSearch}
              onChange={(event) => {
                setRegionSearch(event.target.value);
                setRegionOpen(true);
              }}
              onFocus={() => setRegionOpen(true)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setRegionOpen((current) => !current)}
            >
              <ChevronDown size={16} strokeWidth={2.5} className={`transition-transform ${regionOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {regionOpen ? (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
              {filteredValles.length > 0 ? (
                filteredValles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-[13px] font-semibold transition-colors ${
                      item === form.valle ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      updateForm("valle", item);
                      setRegionSearch(item);
                      setRegionOpen(false);
                    }}
                  >
                    {item}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-center text-[12px] font-medium text-gray-500">No se encontraron regiones</div>
              )}
            </div>
          ) : null}
        </div>

        <div ref={cropRef} className="relative">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Cultivo</p>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} strokeWidth={2.5} />
            </span>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-[13px] font-semibold text-gray-800 shadow-sm transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Buscar cultivo (ej. Palta Hass)"
              value={cropSearch}
              onChange={(event) => {
                setCropSearch(event.target.value);
                setCropOpen(true);
                if (!event.target.value) {
                  updateForm("producto", "");
                }
              }}
              onFocus={() => setCropOpen(true)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setCropOpen((current) => !current)}
            >
              <ChevronDown size={16} strokeWidth={2.5} className={`transition-transform ${cropOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {cropOpen ? (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
              {filteredCultivos.length > 0 ? (
                filteredCultivos.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`w-full px-3 py-2 text-left text-[13px] font-semibold transition-colors ${
                      item === form.producto ? "bg-emerald-50 text-emerald-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      updateForm("producto", item);
                      setCropSearch(item);
                      setCropOpen(false);
                    }}
                  >
                    {item}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-center text-[12px] font-medium text-gray-500">No se encontraron cultivos</div>
              )}
            </div>
          ) : null}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hectareas</span>
          <input
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[13px] font-semibold text-gray-800 shadow-sm transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            onChange={(event) => updateForm("hectareas", event.target.value)}
            value={form.hectareas}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Fecha siembra</span>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-[13px] font-semibold text-gray-800 shadow-sm transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                onChange={(event) => updateForm("fechaSiembra", event.target.value)}
                type="date"
                value={form.fechaSiembra}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar size={14} strokeWidth={2.5} />
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Fecha cosecha</span>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-[13px] font-semibold text-gray-800 shadow-sm transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                onChange={(event) => updateForm("fechaCosecha", event.target.value)}
                type="date"
                value={form.fechaCosecha}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar size={14} strokeWidth={2.5} />
              </span>
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tu inversion (S/) - Opcional</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
              S/
            </span>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-[13px] font-semibold text-gray-800 shadow-sm transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Ej. 50000"
              onChange={(event) => updateForm("inversionPen", event.target.value)}
              value={form.inversionPen}
            />
          </div>
        </label>



        <div className="flex flex-col gap-2.5">
          <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-gray-500">Variables a considerar</p>
          {["Precios historicos (3 anos)", "Intenciones de siembra (SISAP)", "Prediccion ML", "Datos climaticos"].map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2">
              <span className="flex items-center justify-center rounded bg-emerald-50 p-0.5 text-emerald-600">
                <CheckSquare size={16} strokeWidth={2.5} />
              </span>
              <span className="text-[13px] font-medium text-gray-700">{item}</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white"></span>
            <span className="text-[13px] font-medium text-gray-400">Costos de insumos</span>
          </label>
        </div>

        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#208843] px-4 py-3 text-[14px] font-bold text-white shadow-sm transition-colors hover:bg-[#156E3F] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          onClick={handleAnalyzeCampaign}
          type="button"
        >
          <Sparkles size={16} strokeWidth={2.5} />
          {isSubmitting ? "Analizando..." : "Analizar campana"}
        </button>
      </div>
    </div>
  );
}
