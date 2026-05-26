import { z } from "zod";

export const analyzeCampaignQuerySchema = z.object({
  producto: z.string().trim().optional(),
  hectareas: z.coerce.number().positive().optional(),
  fechaSiembra: z.string().trim().optional(),
  fechaCosecha: z.string().trim().optional(),
  valle: z.string().trim().optional(),
  tipoMercado: z.string().trim().optional(),
  inversionPen: z.coerce.number().positive().optional()
});

export type AnalyzeCampaignQueryDto = z.infer<typeof analyzeCampaignQuerySchema>;
