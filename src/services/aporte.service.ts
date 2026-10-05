import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AporteService {
  
  // US5: Guardar un nuevo aporte vinculando el usuarioId directamente
  async crearAporte(userId: string, tmdbId: string, enlaces: { url: string; servidor: string }[]) {
    return await prisma.aporte.create({
      data: {
        tmdbId,
        usuarioId: userId, // <-- OpciÃ³n 1: ConexiÃ³n directa y rÃ¡pida
        estado: 'PENDIENTE',
        enlaces: {
          create: enlaces 
        }
      },
      include: { enlaces: true }
    });
  }

  // US6: Obtener todos los aportes pendientes
  async obtenerPendientes() {
    return await prisma.aporte.findMany({
      where: { estado: 'PENDIENTE' },
      include: { enlaces: true }
    });
  }

  // US6: Cambiar el estado de un aporte usando su id
  async actualizarEstado(id: string, nuevoEstado: 'PUBLICADO' | 'RECHAZADO') {
    return await prisma.aporte.update({
      where: { id },
      data: { estado: nuevoEstado }
    });
  }
}

