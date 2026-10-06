import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { TMDBService } from '../services/tmdb.service.js';

const tmdbService = new TMDBService();

export const getCatalogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const [aportes, total] = await Promise.all([
      prisma.aporte.findMany({
        where: {
          estado: 'PUBLICADO'
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.aporte.count({
        where: {
          estado: 'PUBLICADO'
        }
      })
    ]);

    const datos = await Promise.all(
      aportes.map(async (aporte) => {
        const metadata = await tmdbService.obtenerMetadata(
  aporte.tipo || '', // <-- Agregamos || '' para evitar el riesgo de null
  aporte.tmdbId
);

        return {
          id: aporte.id,
          tmdbId: aporte.tmdbId,
          tipo: aporte.tipo,
          estado: aporte.estado,
          titulo: metadata?.titulo ?? 'Título no disponible',
          poster: metadata?.url_poster ?? null,
          anio: metadata?.fecha_lanzamiento
            ? metadata.fecha_lanzamiento.substring(0, 4)
            : null
        };
      })
    );

    res.status(200).json({
      datos,
      total,
      paginaActual: page,
      limite: limit
    });
  } catch (error) {
    console.error('Error al obtener el catálogo:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};