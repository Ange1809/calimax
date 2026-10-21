import { Request, Response } from 'express';
import { TMDBService } from '../services/tmdb.service.js';
import { PrismaClient } from '@prisma/client';

const tmdbService = new TMDBService();
const prisma = new PrismaClient();

export const getCatalogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 20);

    const tipo = req.query.tipo === 'tv' ? 'tv' : 'pelicula';

    const categoria =
      req.query.categoria === 'mejores'
        ? 'mejores'
        : req.query.categoria === 'populares'
          ? 'populares'
          : 'ultimos';

    const busqueda = typeof req.query.busqueda === 'string'
      ? req.query.busqueda.trim()
      : '';

    const resultado = await tmdbService.obtenerCatalogo(
      tipo,
      categoria,
      page,
      busqueda
    );

    res.status(200).json({
      datos: resultado.datos.slice(0, limit).map((item) => ({
        id: item.tmdbId,
        tmdbId: String(item.tmdbId),
        tipo: item.tipo,
        estado: 'PUBLICADO',
        titulo: item.titulo,
        poster: item.url_poster || null,
        anio: item.fecha_lanzamiento
          ? item.fecha_lanzamiento.substring(0, 4)
          : null
      })),
      total: resultado.total,
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

export const reportarEnlace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { linkId } = req.params;
    const finalId: any = !isNaN(Number(linkId)) ? Number(linkId) : String(linkId);

    // R3.4 — Operación atómica con Prisma para evitar Race Conditions
    const enlaceActualizado = await prisma.enlace.update({
      where: { id: finalId },
      data: {
        reportes: { increment: 1 }
      } as any 
    });

    res.status(200).json({
      message: 'Enlace reportado exitosamente',
      data: enlaceActualizado
    });
  } catch (error) {
    console.error('Error al reportar enlace:', error);
    res.status(404).json({
      error: 'Enlace no encontrado o error al procesar el reporte'
    });
  }
};
