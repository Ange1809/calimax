import {
  registerPublisherSchema,
  registerUsuarioSchema,
} from '../../src/schemas/usuario.schema.js';

describe('esquemas de registro de cuentas', () => {
  it('acepta registro de Usuario con credenciales válidas', () => {
    expect(registerUsuarioSchema.safeParse({
      email: 'usuario@example.com',
      password: 'password123',
    }).success).toBe(true);
  });

  it('rechaza intentos de asignar roles privilegiados en registro público', () => {
    const credenciales = {
      email: 'staff@example.com',
      password: 'password123',
    };

    expect(registerUsuarioSchema.safeParse({
      ...credenciales,
      rol: 'ADMIN',
    }).success).toBe(false);

    expect(registerUsuarioSchema.safeParse({
      ...credenciales,
      rol: 'MODERATOR',
    }).success).toBe(false);

    expect(registerPublisherSchema.safeParse({
      ...credenciales,
      rol: 'ADMIN',
      nombrePublico: 'Staff',
      aceptaTerminos: true,
      enlacesSociales: [{ plataforma: 'Discord', url: 'https://discord.com/users/123' }],
    }).success).toBe(false);
  });

  it('requiere aceptación de términos y un enlace social para Publisher', () => {
    const datosBase = {
      email: 'publisher@example.com',
      password: 'password123',
      nombrePublico: 'Creador',
    };

    expect(registerPublisherSchema.safeParse({
      ...datosBase,
      aceptaTerminos: false,
      enlacesSociales: [{ plataforma: 'Discord', url: 'https://discord.com/users/123' }],
    }).success).toBe(false);

    expect(registerPublisherSchema.safeParse({
      ...datosBase,
      aceptaTerminos: true,
      enlacesSociales: [],
    }).success).toBe(false);
  });

  it('acepta enlaces HTTPS Publisher y rechaza URLs HTTP', () => {
    const datosBase = {
      email: 'publisher@example.com',
      password: 'password123',
      nombrePublico: 'Creador',
      aceptaTerminos: true,
    };

    const resultado = registerPublisherSchema.safeParse({
      ...datosBase,
      enlacesSociales: [{ plataforma: 'Instagram', url: 'https://instagram.com/creator' }],
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.enlacesAlojamiento).toEqual([]);
    }

    expect(registerPublisherSchema.safeParse({
      ...datosBase,
      enlacesSociales: [{ plataforma: 'Instagram', url: 'http://instagram.com/creator' }],
    }).success).toBe(false);
  });
});
