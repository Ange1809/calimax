import { moderarAporteSchema } from '../../src/schemas/moderation.schema.js';

describe('esquema de resolución de aportes', () => {
  it('requiere una calificación antes de aprobar y publicar', () => {
    expect(moderarAporteSchema.safeParse({ estado: 'PUBLICADO' }).success).toBe(false);
    expect(moderarAporteSchema.safeParse({
      estado: 'PUBLICADO',
      calidad: 4,
    }).success).toBe(true);
  });

  it('permite rechazar contenido con una nota sin publicarlo', () => {
    expect(moderarAporteSchema.safeParse({
      estado: 'RECHAZADO',
      comentario: 'El enlace no funciona.',
    }).success).toBe(true);
  });
});
