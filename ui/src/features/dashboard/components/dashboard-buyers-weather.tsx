import type { HomeShowcaseResponse } from "../../showcase/types";
import { UiCard } from "../../../components/ui/ui-card";
import { views } from "../../../config/views";
import { formatCurrency, renderWeatherIcon } from "./dashboard-helpers";

export type DashboardBuyersWeatherProps = {
  buyerHighlights: HomeShowcaseResponse["buyers"];
  weatherForecast: HomeShowcaseResponse["weatherForecast"];
  location: HomeShowcaseResponse["summary"]["location"];
};

export function DashboardBuyersWeather({ 
  buyerHighlights, 
  weatherForecast, 
  location 
}: DashboardBuyersWeatherProps) {
  return (
    <section className="col-span-1 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 px-1 mt-1">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight text-gray-900">Compradores activos</h3>
          <p className="text-[12px] font-medium text-gray-400">{buyerHighlights.length} ofertas compatibles con tus cultivos</p>
        </div>
        <a href={views.market} className="text-[13px] font-bold text-[#208843] hover:text-[#156E3F] transition-colors">
          Ver &gt;
        </a>
      </div>

      <UiCard className="p-4 shadow-sm border-gray-200 flex flex-col gap-4">
        {buyerHighlights.map((buyer, index) => (
          <div key={buyer.buyerName} className={index === 0 ? "" : "pt-3 border-t border-gray-100"}>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#1B2533] text-white font-bold text-[12px]">
                  {buyer.initials}
                </span>
                <div>
                  <h4 className="text-[13px] font-bold text-gray-900 leading-none">
                    {buyer.buyerName}
                    {buyer.verified ? <span className="text-[#208843]"> ●</span> : null}
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500">
                    {buyer.productoNombre} · {buyer.volumeLabel}
                  </p>
                </div>
              </div>
              <strong className="text-[13px] font-black text-[#208843]">
                {formatCurrency(buyer.offeredPricePen)}
                <span className="text-[10px] text-gray-400 font-bold">/kg</span>
              </strong>
            </div>
          </div>
        ))}
      </UiCard>

      <div className="flex items-center justify-between gap-3 px-1 mt-2">
        <div>
          <h3 className="text-[16px] font-bold tracking-tight text-gray-900">Clima - {location}</h3>
          <p className="text-[12px] font-medium text-gray-400">Próximos 5 días</p>
        </div>
      </div>
      <UiCard className="p-4 shadow-sm border-gray-200">
        <div className="flex justify-between items-center text-center">
          {weatherForecast.map((day) => (
            <div key={day.dayLabel} className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-gray-400 mb-2">{day.dayLabel}</span>
              {renderWeatherIcon(day.conditionCode)}
              <span className="text-[13px] font-bold text-gray-900">{day.temperatureC}°</span>
            </div>
          ))}
        </div>
      </UiCard>
    </section>
  );
}
