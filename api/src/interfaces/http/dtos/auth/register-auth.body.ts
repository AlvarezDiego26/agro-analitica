import { z } from "zod";

export const registerAuthBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(3).max(120),
  phone: z.string().max(30).optional().nullable(),
  regionCode: z.string().max(50).optional().nullable(),
  valleyName: z.string().max(80).optional().nullable(),
  producerType: z.string().max(50).optional().nullable(),
  primaryCrop: z.string().max(80).optional().nullable()
});
