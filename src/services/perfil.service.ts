import { prisma } from '../lib/prisma.js';
import { ActualizarPerfilDto } from '../schemas/perfil.schema.js';

const perfilSelect = {
  id: true,
  email: true,
  rol: true,
  nombrePublico: true,
  fotoPerfilUrl: true,
  biografia: true,
  puntosAporte: true,
  calidadPromedio: true,
  ultimoAcceso: true,
  publisherLinks: {
    select: {
      categoria: true,
      plataforma: true,
      url: true,
    },
  },
} as const;

export class PerfilService {
  async obtener(id: number) {
    return prisma.usuario.findUnique({
      where: { id },
      select: perfilSelect,
    });
  }

  async actualizar(id: number, datos: ActualizarPerfilDto) {
    return prisma.usuario.update({
      where: { id },
      data: datos,
      select: perfilSelect,
    });
  }
}
