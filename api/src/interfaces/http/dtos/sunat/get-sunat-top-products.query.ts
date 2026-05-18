import { z } from 'zod';

export const getSunatTopProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(5)
});

export type GetSunatTopProductsQueryDto = z.infer<typeof getSunatTopProductsQuerySchema>;
