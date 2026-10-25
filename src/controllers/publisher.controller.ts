import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export class PublisherController {
  async cartelera(_req: Request, res: Response): Promise<void> {
    try {
      const aportes = await prisma.aporte.findMany({
        where: { estado: 'PUBLICADO', usuario: { rol: 'PUBLISHER' } },
        orderBy: { updatedAt: 'desc' },
        include: {
          enlaces: { select: { id: true, url: true, servidor: true } },
          usuario: {
            select: {
              id: true,
              nombrePublico: true,
              fotoPerfilUrl: true,
              puntosAporte: true,
              calidadPromedio: true,
              ultimoAcceso: true,
              publisherLinks: {
                where: { categoria: 'SOCIAL' },
                select: { plataforma: true, url: true },
              },
            },
          },
        },
      });

      res.status(200).json({
        datos: aportes.map((aporte) => ({
          id: aporte.id,
          tmdbId: aporte.tmdbId,
          titulo: aporte.titulo,
          tipo: aporte.tipo,
          publicadoEn: aporte.updatedAt,
          enlaces: aporte.enlaces,
          publisher: {
            id: aporte.usuario.id,
            nombrePublico: aporte.usuario.nombrePublico,
            fotoPerfilUrl: aporte.usuario.fotoPerfilUrl,
            puntosAporte: aporte.usuario.puntosAporte,
            calidadPromedio: aporte.usuario.calidadPromedio,
            activoDiariamente: aporte.usuario.ultimoAcceso !== null &&
              aporte.usuario.ultimoAcceso.getTime() >= Date.now() - 24 * 60 * 60 * 1000,
            redes: aporte.usuario.publisherLinks,
          },
        })),
      });
    } catch (error) {
      console.error('Error al cargar la cartelera de aportes:', error);
      res.status(500).json({ error: 'No se pudo cargar la cartelera' });
    }
  }

  async perfilPublico(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      res.status(400).json({ error: 'Identificador de Publisher inválido' });
      return;
    }

    try {
      const publisher = await prisma.usuario.findFirst({
        where: { id, rol: 'PUBLISHER' },
        select: {
          id: true,
          nombrePublico: true,
          fotoPerfilUrl: true,
          biografia: true,
          puntosAporte: true,
          calidadPromedio: true,
          ultimoAcceso: true,
          publisherLinks: {
            where: { categoria: 'SOCIAL' },
            select: { plataforma: true, url: true },
          },
          aportes: {
            where: { estado: 'PUBLICADO' },
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              tmdbId: true,
              titulo: true,
              tipo: true,
              updatedAt: true,
              enlaces: { select: { id: true, url: true, servidor: true } },
            },
          },
        },
      });

      if (!publisher) {
        res.status(404).json({ error: 'Perfil Publisher no encontrado' });
        return;
      }

      res.status(200).json({
        perfil: {
          id: publisher.id,
          nombrePublico: publisher.nombrePublico,
          fotoPerfilUrl: publisher.fotoPerfilUrl,
          biografia: publisher.biografia,
          puntosAporte: publisher.puntosAporte,
          calidadPromedio: publisher.calidadPromedio,
          activoDiariamente: publisher.ultimoAcceso !== null &&
            publisher.ultimoAcceso.getTime() >= Date.now() - 24 * 60 * 60 * 1000,
          redes: publisher.publisherLinks,
          aportes: publisher.aportes,
        },
      });
    } catch (error) {
      console.error('Error al cargar perfil Publisher:', error);
      res.status(500).json({ error: 'No se pudo cargar el perfil Publisher' });
    }
  }
}
