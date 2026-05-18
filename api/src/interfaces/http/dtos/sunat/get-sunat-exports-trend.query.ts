import { z } from 'zod';

export const getSunatExportsTrendQuerySchema = z.object({
  productoKey: z.string().trim().min(1, 'productoKey es requerido'),
  limit: z.coerce.number().int().min(1).max(36).optional().default(12)
});

export type GetSunatExportsTrendQueryDto = z.infer<typeof getSunatExportsTrendQuerySchema>;
