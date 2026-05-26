import { z } from "zod";

export const createFarmBodySchema = z.object({
  farmName: z.string().min(2).max(120),
  regionCode: z.string().min(2).max(60),
  provinceName: z.string().max(80).optional().nullable(),
  districtName: z.string().max(80).optional().nullable(),
  locationLabel: z.string().max(160).optional().nullable(),
  totalHectares: z.coerce.number().positive(),
  waterSource: z.string().max(80).optional().nullable()
});
