import { Request, Response } from 'express';
import { TMDBService } from '../services/tmdb.service.js';

const tmdbService = new TMDBService();

export const getMetadata = async (req: Request, res: Response) => {
  const { tipo, id } = req.params;

  // Validación estricta para evitar URLs rotas
  if (tipo !== 'pelicula' && tipo !== 'tv') {
    return res.status(400).json({ error: 'El tipo debe ser "pelicula" o "tv"' });
  }

  try {
    const metadata = await tmdbService.obtenerMetadata(tipo, id);

    if (!metadata) {
      return res.status(404).json({ error: 'Multimedia no encontrada' });
    }

    return res.status(200).json(metadata);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
