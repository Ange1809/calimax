import { Response } from 'express';
import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { TMDBService } from '../services/tmdb.service.js';

const aporteSchema = z.object({
  tmdbId: z.union([
    z.string().regex(/^\d+$/),
    z.number().int().positive(),
  ]).optional(),
  titulo: z.string().trim().min(1).max(200).optional(),
  tipo: z.enum(['pelicula', 'tv']).optional(),
  enlaces: z.array(z.object({
    url: z.string().url().max(2048).refine((value) => value.startsWith('https://')),
    servidor: z.string().trim().min(1).max(60),
  }).strict()).min(1).max(10),
}).strict().refine(
  (data) => data.tmdbId !== undefined || data.titulo !== undefined,
  { message: 'Se requiere un ID de TMDB o título' },
).refine(
  (data) => data.tipo !== 'tv' || data.tmdbId !== undefined,
  { message: 'Las series requieren un ID de TMDB' },
);

export class AporteController {
  constructor(
    private readonly database: Pick<PrismaClient, 'aporte'> = prisma,
    private readonly tmdbService: Pick<TMDBService, 'buscarPeliculaPorTitulo'> = new TMDBService()
  ) {}

  // Crear un aporte con sus respectivos enlaces vinculados (US5)
  async crearAporte(req: any, res: Response) {
    try {
      const parsed = aporteSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({ error: 'Estructura DTO de envío inválida' });
      }

      const { tmdbId, titulo, tipo, enlaces } = parsed.data;
      const usuarioId = req.user?.userId;

      if (!usuarioId) {
        return res.status(401).json({ error: 'Sesión de usuario no válida o ausente' });
      }

      let idPelicula = tmdbId === undefined ? '' : String(tmdbId).trim();
      let tituloPelicula = titulo ?? null;
      let tipoMultimedia: 'pelicula' | 'tv' = tipo ?? 'pelicula';

      if (tmdbId === undefined && titulo !== undefined) {
        const pelicula = await this.tmdbService.buscarPeliculaPorTitulo(titulo);
        if (!pelicula) {
          return res.status(404).json({ error: 'Película no encontrada en TMDB' });
        }
        idPelicula = String(pelicula.tmdbId);
        tituloPelicula = pelicula.titulo;
        tipoMultimedia = 'pelicula';
      }

      const nuevoAporte = await this.database.aporte.create({
        data: {
          tmdbId: idPelicula,
          titulo: tituloPelicula,
          tipo: tipoMultimedia,
          usuarioId: Number(usuarioId),
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

      return res.status(201).json({
        data: { ...nuevoAporte, titulo: tituloPelicula },
      });
    } catch (error) {
      console.error('Error al procesar el aporte:', error);
      return res.status(500).json({ error: 'Error al procesar el aporte' });
    }
  }

}
