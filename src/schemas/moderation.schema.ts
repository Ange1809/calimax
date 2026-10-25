import { z } from 'zod';

export const moderarAporteSchema = z.object({
  estado: z.enum(['PUBLICADO', 'RECHAZADO']),
  comentario: z.string().trim().max(1000).optional().default(''),
  calidad: z.number().int().min(1).max(5).optional(),
}).strict().refine(
  (data) => data.estado !== 'PUBLICADO' || data.calidad !== undefined,
  { message: 'La calidad es requerida al aprobar contenido' },
);
