import { z } from 'zod';

const textoOpcional = (maxLength: number, minLength = 0) =>
  z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? null : value,
    z.string().trim().min(minLength).max(maxLength).nullable().optional(),
  );

const fotoPerfilUrlSchema = z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? null : value,
  z.string()
    .url('La foto debe ser una URL válida.')
    .max(2048)
    .refine((value) => new URL(value).protocol === 'https:', 'La foto debe usar HTTPS.')
    .nullable()
    .optional(),
);

export const actualizarPerfilSchema = z.object({
  nombrePublico: textoOpcional(60, 2),
  biografia: textoOpcional(280),
  fotoPerfilUrl: fotoPerfilUrlSchema,
}).strict().refine(
  (value) => Object.values(value).some((field) => field !== undefined),
  'Indicá al menos un campo para actualizar.',
);

export type ActualizarPerfilDto = z.infer<typeof actualizarPerfilSchema>;
