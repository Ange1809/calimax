import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AporteController {
  // Crear un aporte con sus respectivos enlaces vinculados (US5)
  async crearAporte(req: any, res: Response) {
    try {
      const { tmdbId, tipo, enlaces } = req.body;
      const usuarioId = req.user?.userId; // ExtraÃ­do de forma segura desde el JWT decodificado

      if (!tmdbId || !enlaces || !Array.isArray(enlaces)) {
        return res.status(400).json({ error: 'Estructura DTO de envÃ­o invÃ¡lida' });
      }

      if (!usuarioId) {
        return res.status(401).json({ error: 'SesiÃ³n de usuario no vÃ¡lida o ausente' });
      }

      const nuevoAporte = await prisma.aporte.create({
        data: {
          tmdbId: String(tmdbId),
          tipo: String(tipo),
          usuarioId: Number(usuarioId),
          estado: 'PENDIENTE', // Estado inicial obligatorio por DoD
          enlaces: {
            create: enlaces.map((e: any) => ({
              url: e.url,
              servidor: e.servidor,
            })),
          },
        },
        include: { enlaces: true }
      });

      return res.status(201).json({ data: nuevoAporte });
    } catch (error) {
      return res.status(500).json({ error: 'Error al procesar el aporte en la base de datos' });
    }
  }

  // Cambiar el estado del aporte (Panel de ModeraciÃ³n - US6)
  async cambiarEstado(req: Request, res: Response) {
    try {
      const { id } = req.params; // ID del aporte (UUID String)
      const { estado } = req.body;

      if (estado !== 'PUBLICADO' && estado !== 'RECHAZADO') {
        return res.status(400).json({ error: 'El estado solo acepta PUBLICADO o RECHAZADO' });
      }

      const aporteActualizado = await prisma.aporte.update({
        where: { id: Number(id) },
        data: { estado },
      });

      return res.status(200).json({ data: aporteActualizado });
    } catch (error) {
      return res.status(404).json({ error: 'Aporte no encontrado' });
    }
  }
}

