import { useState } from "react";
import { Calendar, Sprout, TrendingUp, AlertTriangle, CheckCircle2, MoreVertical, Edit2, Trash2, X } from "lucide-react";
import { UiCard } from "../../../components/ui/ui-card";
import { formatCurrency, formatSignedPercent } from "./dashboard-helpers";
import type { UserCampaign } from "../../planificador/services/get-current-user-campaigns";
import { views } from "../../../config/views";
import Link from "next/link";
import { deleteCampaign } from "../../planificador/services/delete-campaign";
import { updateCampaign } from "../../planificador/services/update-campaign";

export function CampaignCard({ campaign }: { campaign: UserCampaign }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [editData, setEditData] = useState({
    cropName: campaign.cropName,
    sowingDate: campaign.sowingDate ? campaign.sowingDate.split("T")[0] : "",
    hectares: campaign.hectares,
    campaignStatus: campaign.campaignStatus,
    estimatedInvestmentPen: campaign.estimatedInvestmentPen?.toString() || "",
  });

  const isHighRisk = campaign.plannerRiskLevel === "high";
  const isMediumRisk = campaign.plannerRiskLevel === "medium";

  const statusColor = campaign.campaignStatus === "draft" ? "bg-gray-100 text-gray-700" : "bg-emerald-100 text-emerald-700";
  const statusLabel = campaign.campaignStatus === "draft" ? "Borrador" : "Activa";

  const riskColor = isHighRisk 
    ? "bg-red-50 text-red-700 border-red-200" 
    : isMediumRisk 
      ? "bg-amber-50 text-amber-700 border-amber-200" 
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la campaña de ${campaign.cropName}?`)) return;
    setIsDeleting(true);
    try {
      await deleteCampaign(campaign.id);
      window.dispatchEvent(new Event("campaigns-updated"));
      setIsDeleting(false);
    } catch (e) {
      console.error(e);
      alert("Error al eliminar la campaña");
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedInvestment = editData.estimatedInvestmentPen === "" ? null : parseFloat(editData.estimatedInvestmentPen);
      const payload = {
        ...editData,
        sowingDate: editData.sowingDate ? new Date(editData.sowingDate).toISOString() : undefined,
        hectares: Number(editData.hectares),
        estimatedInvestmentPen: parsedInvestment === 0 ? null : parsedInvestment, // If 0, send null
      };
      await updateCampaign(campaign.id, payload as any);
      setIsEditModalOpen(false);
      window.dispatchEvent(new Event("campaigns-updated"));
    } catch (e) {
      console.error(e);
      alert("Error al actualizar la campaña");
    }
  };

  return (
    <>
      <UiCard className={`flex flex-col p-5 hover:shadow-md transition-shadow relative ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isHighRisk ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <Sprout size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[16px] capitalize">{campaign.cropName}</h3>
              <p className="text-gray-500 text-[13px] font-medium">{campaign.hectares} hectáreas • {campaign.marketType}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${statusColor}`}>
              {statusLabel}
            </span>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 top-8 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden py-1">
                  <button 
                    onClick={() => { setIsDropdownOpen(false); setIsEditModalOpen(true); }}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => { setIsDropdownOpen(false); handleDelete(); }}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              <Calendar size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Siembra</span>
            </div>
            <span className="text-gray-900 font-bold text-[14px]">
              {new Date(campaign.sowingDate).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className={`p-3 rounded-lg border ${riskColor}`}>
            <div className="flex items-center gap-1.5 mb-1 opacity-80">
              {isHighRisk ? <AlertTriangle size={14} /> : isMediumRisk ? <TrendingUp size={14} /> : <CheckCircle2 size={14} />}
              <span className="text-[11px] font-bold uppercase tracking-wider">ROI Proyectado</span>
            </div>
            <span className="font-black text-[15px]">
              {campaign.estimatedRoiPct ? formatSignedPercent(campaign.estimatedRoiPct) : "N/A"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-bold uppercase">Inversión Estimada</span>
            <span className="text-gray-900 font-bold text-[14px]">
              {campaign.estimatedInvestmentPen ? formatCurrency(campaign.estimatedInvestmentPen) : "Sin definir"}
            </span>
          </div>
          <Link 
            href={`${views.planner}?crop=${encodeURIComponent(campaign.cropName)}`}
            className="text-emerald-600 font-bold text-[13px] hover:text-emerald-700 transition-colors"
          >
            Ver en planificador →
          </Link>
        </div>
      </UiCard>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-[16px]">Editar Campaña</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Nombre del Cultivo</label>
                  <input 
                    type="text" 
                    value={editData.cropName} 
                    onChange={e => setEditData({...editData, cropName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Fecha de Siembra</label>
                  <input 
                    type="date" 
                    value={editData.sowingDate} 
                    onChange={e => setEditData({...editData, sowingDate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Hectáreas</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={editData.hectares} 
                  onChange={e => setEditData({...editData, hectares: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Inversión Estimada (S/)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editData.estimatedInvestmentPen} 
                  onChange={e => setEditData({...editData, estimatedInvestmentPen: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Ej. 20000"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">Estado</label>
                <select 
                  value={editData.campaignStatus} 
                  onChange={e => setEditData({...editData, campaignStatus: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activa</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-[14px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-[14px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
