import { Request, Response } from 'express';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { TMDBService } from '../services/tmdb.service.js';

export class AporteController {
  constructor(
    private readonly database: Pick<PrismaClient, 'aporte'> = prisma,
    private readonly tmdbService: Pick<TMDBService, 'buscarPeliculaPorTitulo'> = new TMDBService()
  ) {}

  // Crear un aporte con sus respectivos enlaces vinculados (US5)
  async crearAporte(req: any, res: Response) {
    try {
      const { tmdbId, titulo, tipo, enlaces } = req.body ?? {};
      const usuarioId = req.user?.userId;
      const tmdbIdValido =
        (typeof tmdbId === 'string' || typeof tmdbId === 'number') &&
        /^\d+$/.test(String(tmdbId).trim());
      const tituloValido = typeof titulo === 'string' && titulo.trim().length > 0;

      if (
        (!tmdbIdValido && !tituloValido) ||
        !Array.isArray(enlaces) ||
        (tipo !== undefined && tipo !== 'pelicula' && tipo !== 'tv')
      ) {
        return res.status(400).json({ error: 'Estructura DTO de envío inválida' });
      }

      if (!usuarioId) {
        return res.status(401).json({ error: 'Sesión de usuario no válida o ausente' });
      }

      let idPelicula = tmdbIdValido ? String(tmdbId).trim() : '';
      let tituloPelicula = tituloValido ? titulo.trim() : null;
      let tipoMultimedia: 'pelicula' | 'tv' = tipo ?? 'pelicula';

      if (!tmdbIdValido) {
        const pelicula = await this.tmdbService.buscarPeliculaPorTitulo(titulo.trim());
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
          tipo: tipoMultimedia,
          usuarioId: Number(usuarioId),
          estado: 'PENDIENTE',
          enlaces: {
            create: enlaces.map((e: any) => ({
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
    } catch {
      return res.status(500).json({ error: 'Error al procesar el aporte' });
    }
  }

  // Cambiar el estado del aporte (Panel de Moderación - US6)
  async cambiarEstado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (estado !== 'PUBLICADO' && estado !== 'RECHAZADO') {
        return res.status(400).json({ error: 'El estado solo acepta PUBLICADO o RECHAZADO' });
      }

      const aporteActualizado = await this.database.aporte.update({
        where: { id: Number(id) },
        data: { estado },
      });

      return res.status(200).json({ data: aporteActualizado });
    } catch {
      return res.status(404).json({ error: 'Aporte no encontrado' });
    }
  }
}
