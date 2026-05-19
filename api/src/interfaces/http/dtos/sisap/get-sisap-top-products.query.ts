import { z } from 'zod';

export const getSisapTopProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10)
});

export type GetSisapTopProductsQueryDto = z.infer<typeof getSisapTopProductsQuerySchema>;
