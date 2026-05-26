import { z } from "zod";

export const createCampaignBodySchema = z.object({
  cropName: z.string().min(1, "El cultivo es requerido"),
  sowingDate: z.string().min(1, "La fecha de siembra es requerida"),
  hectares: z.number().positive("Las hectáreas deben ser mayor a 0"),
  marketType: z.enum(["local", "exportacion", "industrial"]).optional(),
  campaignStatus: z.enum(["draft", "planned", "active", "completed", "cancelled"]).optional(),
  estimatedRoiPct: z.number().nullable().optional(),
  estimatedInvestmentPen: z.number().nullable().optional(),
  plannerRiskLevel: z.enum(["low", "medium", "high"]).nullable().optional(),
  farmId: z.string().uuid().nullable().optional(),
  parcelId: z.string().uuid().nullable().optional()
});
