import { Request, Response } from 'express';
import { TMDBService } from '../services/tmdb.service.js';

const tmdbService = new TMDBService();

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

    const datos = await tmdbService.obtenerCatalogo(
      tipo,
      categoria,
      page
    );

    res.status(200).json({
      datos: datos.slice(0, limit).map((item) => ({
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
      total: 100,
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