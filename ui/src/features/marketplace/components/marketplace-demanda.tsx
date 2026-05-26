"use client";

import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { UiCard } from "../../../components/ui/ui-card";
import { formatCurrency, toNumber } from "../../dashboard/components/dashboard-helpers";
import { useAuth } from "../../../providers/auth-provider";
import type { MarketBuyersShowcaseResponse } from "../../showcase/types";

export function MarketplaceDemanda({ buyersShowcase }: Readonly<{ buyersShowcase: MarketBuyersShowcaseResponse }>) {
  const { isAuthenticated, requireAuth } = useAuth();

  return (
    <UiCard className="p-0 shadow-sm border-gray-200 overflow-hidden w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-white">
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[30%]">COMPRADOR</th>
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[20%]">CULTIVO</th>
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[20%]">CANTIDAD / ENTREGA</th>
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[15%]">PRECIO OFRECIDO</th>
              <th className="py-4 px-6 text-[10px] font-black tracking-widest uppercase text-gray-400 w-[15%]">MATCH IA</th>
              <th className="py-4 px-6 w-[120px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {buyersShowcase.buyers.map((buyer) => {
              const matchScorePct = toNumber(buyer.matchScorePct);
              const offeredPricePen = toNumber(buyer.offeredPricePen);
              const matchTone = getMatchTone(matchScorePct);

              return (
                <tr key={`${buyer.buyerName}-${buyer.productoNombre}`} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-5 px-6">
                    <div className="flex gap-4 items-center">
                      <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#1B2533] text-white font-bold text-[14px] shadow-sm">
                        {buyer.initials}
                      </span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-emerald-800 transition-colors">
                            {buyer.buyerName}
                          </h3>
                          {buyer.verified ? <BadgeCheck size={14} strokeWidth={2.5} className="text-[#208843]" /> : null}
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 mt-0.5">{buyer.buyerType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-[13px] font-bold text-gray-700">{buyer.productoNombre}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-gray-900">{buyer.volumeLabel}</span>
                      <span className="text-[11px] font-medium text-gray-400 mt-0.5">{buyer.deliveryLabel}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-baseline text-[#208843]">
                      <strong className="text-[16px] font-black tracking-tight leading-none">
                        {formatCurrency(offeredPricePen)}
                      </strong>
                      <span className="text-[11px] font-bold ml-0.5">/kg</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${matchTone.barClassName}`} style={{ width: `${matchScorePct}%` }}></div>
                      </div>
                      <span className={`text-[12px] font-black ${matchTone.textClassName}`}>{matchScorePct}%</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated && !requireAuth("Crea tu cuenta para postular tu cosecha a compradores verificados.")) {
                          return;
                        }
                        toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
                          loading: `Enviando postulacion a ${buyer.buyerName}...`,
                          success: "Postulacion enviada correctamente.",
                          error: "Error al enviar la postulacion."
                        });
                      }}
                      className="px-5 py-2 rounded-lg bg-[#208843] text-white font-bold text-[12px] shadow-sm hover:bg-[#156E3F] transition-colors"
                    >
                      Postular
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </UiCard>
  );
}

function getMatchTone(matchScorePct: number) {
  if (matchScorePct >= 80) return { barClassName: "bg-[#208843]", textClassName: "text-[#208843]" };
  if (matchScorePct >= 60) return { barClassName: "bg-[#D97706]", textClassName: "text-[#D97706]" };
  return { barClassName: "bg-[#DC2626]", textClassName: "text-[#DC2626]" };
}
