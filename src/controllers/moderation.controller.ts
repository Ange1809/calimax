import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { moderarAporteSchema } from '../schemas/moderation.schema.js';

export class ModerationController {
  async listarPendientes(_req: Request, res: Response): Promise<void> {
    try {
      const aportes = await prisma.aporte.findMany({
        where: { estado: 'PENDIENTE' },
        orderBy: { createdAt: 'asc' },
        include: {
          enlaces: true,
          usuario: {
            select: {
              id: true,
              nombrePublico: true,
              publisherLinks: {
                where: { categoria: 'SOCIAL' },
                select: { plataforma: true, url: true },
              },
            },
          },
        },
      });
      res.status(200).json({ datos: aportes });
    } catch (error) {
      console.error('Error al listar aportes pendientes:', error);
      res.status(500).json({ error: 'No se pudo cargar la bandeja de moderación' });
    }
  }

  async resolver(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const parsed = moderarAporteSchema.safeParse(req.body);
    const moderatedById = Number((req as Request & { user?: { userId: string } }).user?.userId);

    if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(moderatedById)) {
      res.status(400).json({ error: 'Identificador de aporte o moderador inválido' });
      return;
    }

    if (!parsed.success) {
      res.status(400).json({ error: 'Resolución inválida; aprobar requiere una calidad de 1 a 5' });
      return;
    }

    try {
      const result = await prisma.$transaction(async (transaction) => {
        const aporte = await transaction.aporte.findUnique({
          where: { id },
          select: { id: true, usuarioId: true },
        });

        if (!aporte) {
          return { kind: 'not-found' as const };
        }

        const updated = await transaction.aporte.updateMany({
          where: { id, estado: 'PENDIENTE' },
          data: {
            estado: parsed.data.estado,
            moderadoPorId: moderatedById,
            moderadoEn: new Date(),
            comentarioModeracion: parsed.data.comentario,
            calidadModeracion: parsed.data.estado === 'PUBLICADO'
              ? parsed.data.calidad
              : null,
          },
        });

        if (updated.count === 0) {
          return { kind: 'already-reviewed' as const };
        }

        if (parsed.data.estado === 'PUBLICADO') {
          await transaction.usuario.update({
            where: { id: aporte.usuarioId },
            data: { puntosAporte: { increment: 1 } },
          });

          const calidad = await transaction.aporte.aggregate({
            where: { usuarioId: aporte.usuarioId, estado: 'PUBLICADO' },
            _avg: { calidadModeracion: true },
          });

          await transaction.usuario.update({
            where: { id: aporte.usuarioId },
            data: { calidadPromedio: calidad._avg.calidadModeracion },
          });
        }

        return { kind: 'resolved' as const };
      });

      if (result.kind === 'not-found') {
        res.status(404).json({ error: 'Aporte no encontrado' });
        return;
      }
      if (result.kind === 'already-reviewed') {
        res.status(409).json({ error: 'El aporte ya fue revisado' });
        return;
      }

      res.status(200).json({ mensaje: 'Resolución de moderación guardada' });
    } catch (error) {
      console.error('Error al resolver aporte:', error);
      res.status(500).json({ error: 'No se pudo guardar la resolución' });
    }
  }
}
