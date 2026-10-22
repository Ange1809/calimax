import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AporteService {
  // Crear un nuevo aporte en la base de datos
  async crearAporte(tmdbId: string, tipo: string, userId: string, enlaces: Array<{ url: string; servidor: string }>) {
    return await prisma.aporte.create({
      data: {
        tmdbId: String(tmdbId),
        tipo: String(tipo),
        usuarioId: Number(userId),
        estado: 'PENDIENTE',
        enlaces: {
          create: enlaces.map((e) => ({
            url: e.url,
            servidor: e.servidor,
          })),
        },
      },
      include: { enlaces: true },
    });
  }

  // Actualizar el estado de un aporte (Panel de moderación)
  async actualizarEstado(id: string, estado: 'PUBLICADO' | 'RECHAZADO') {
    return await prisma.aporte.update({
      where: { id: Number(id) },
      data: { estado },
    });
  }
}
