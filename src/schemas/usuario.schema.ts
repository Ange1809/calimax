import { z } from 'zod';

export const registerUsuarioSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type RegisterUsuarioDto = z.infer<typeof registerUsuarioSchema>;
