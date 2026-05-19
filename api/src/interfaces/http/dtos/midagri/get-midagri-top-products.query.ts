import { z } from 'zod';

export const getMidagriTopProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10)
});

export type GetMidagriTopProductsQueryDto = z.infer<typeof getMidagriTopProductsQuerySchema>;
