import { actualizarPerfilSchema } from '../../src/schemas/perfil.schema.js';

describe('esquema de actualización de perfil', () => {
  it('normaliza campos vacíos y acepta URL HTTPS de foto', () => {
    const resultado = actualizarPerfilSchema.safeParse({
      nombrePublico: '  Creador  ',
      biografia: '  ',
      fotoPerfilUrl: 'https://images.example.com/avatar.png',
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual({
        nombrePublico: 'Creador',
        biografia: null,
        fotoPerfilUrl: 'https://images.example.com/avatar.png',
      });
    }
  });

  it('rechaza fotos no HTTPS, roles y actualizaciones vacías', () => {
    expect(actualizarPerfilSchema.safeParse({ fotoPerfilUrl: 'http://example.com/avatar.png' }).success)
      .toBe(false);
    expect(actualizarPerfilSchema.safeParse({ rol: 'ADMIN' }).success).toBe(false);
    expect(actualizarPerfilSchema.safeParse({}).success).toBe(false);
  });

  it('limita la biografía y el nombre público', () => {
    expect(actualizarPerfilSchema.safeParse({
      biografia: 'x'.repeat(281),
    }).success).toBe(false);
    expect(actualizarPerfilSchema.safeParse({
      nombrePublico: 'x',
    }).success).toBe(false);
  });
});
