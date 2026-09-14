import { Request, Response } from 'express';
import { TMDBService } from '../services/tmdb.service.js';

const tmdbService = new TMDBService();

export const getMetadata = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const metadata = await tmdbService.obtenerMetadata(id);

    if (!metadata) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    return res.status(200).json(metadata);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
