import { z } from 'zod';

const credencialesRegistroSchema = z.object({
  email: z.string().email('Ingresá un correo válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
}).strict();

const publisherLinkSchema = z.object({
  plataforma: z.string().trim().min(1).max(40),
  url: z.string().url().max(2048).refine((value) => value.startsWith('https://')),
}).strict();

export const registerUsuarioSchema = credencialesRegistroSchema;

export const registerPublisherSchema = credencialesRegistroSchema.extend({
  nombrePublico: z.string().trim()
    .min(2, 'El nombre público debe tener al menos 2 caracteres.')
    .max(60, 'El nombre público no puede superar 60 caracteres.'),
  aceptaTerminos: z.literal(true),
  enlacesSociales: z.array(publisherLinkSchema)
    .min(1, 'Agregá al menos un enlace a una red social.')
    .max(10, 'Podés añadir hasta 10 redes sociales.'),
  enlacesAlojamiento: z.array(publisherLinkSchema).max(10).optional().default([]),
});

export type RegisterUsuarioDto = z.infer<typeof registerUsuarioSchema>;
export type RegisterPublisherDto = z.infer<typeof registerPublisherSchema>;
