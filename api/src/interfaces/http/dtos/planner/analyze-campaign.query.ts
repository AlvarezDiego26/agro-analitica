import { z } from "zod";

export const analyzeCampaignQuerySchema = z.object({
  producto: z.string().trim().min(1).optional(),
  hectareas: z.coerce.number().positive().optional(),
  fechaSiembra: z.string().trim().min(1).optional(),
  valle: z.string().trim().min(1).optional()
});

export type AnalyzeCampaignQueryDto = z.infer<typeof analyzeCampaignQuerySchema>;
