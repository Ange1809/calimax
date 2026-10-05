<<<<<<< HEAD
import { Request, Response } from 'express';
import { AporteService } from '../services/aporte.service.js'; // <-- Corregido a .js

const aporteService = new AporteService();

export class AporteController {

  async enviarAporte(req: Request, res: Response): Promise<void> {
    try {
      const { tmdbId, enlaces } = req.body;
      const userId = (req as any).user?.userId || "id-temporal-de-prueba";

      if (!tmdbId || !enlaces || !Array.isArray(enlaces)) {
        res.status(400).json({ error: 'Datos de aporte inválidos o incompletos.' });
        return;
      }

      const nuevoAporte = await aporteService.crearAporte(userId, tmdbId, enlaces);
      res.status(201).json(nuevoAporte);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async listarPendientes(req: Request, res: Response): Promise<void> {
    try {
      const pendientes = await aporteService.obtenerPendientes();
      res.status(200).json(pendientes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (estado !== 'PUBLICADO' && estado !== 'RECHAZADO') {
        res.status(400).json({ error: 'El estado solo puede ser PUBLICADO o RECHAZADO.' });
        return;
      }

      // <-- Corregido aquí: cambiar actualizationEstado por actualizarEstado
      const aporteActualizado = await aporteService.actualizarEstado(id, estado);
      res.status(200).json(aporteActualizado);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
=======
﻿import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../lib/prisma.js';

export const eliminarAporte = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const aporteId = parseInt(req.params.id);
    const userId = req.usuario!.id;
    const userRole = req.usuario!.rol;

    const aporte = await prisma.aporte.findUnique({
      where: { id: aporteId }
    });

    if (!aporte) {
      res.status(404).json({ error: 'Aporte no encontrado' });
      return;
    }

    // IDOR Protection: The user must be the author of the Aporte OR an ADMIN/MODERATOR
    if (userRole !== 'MODERATOR' && aporte.usuarioId !== userId) {
      res.status(403).json({ error: 'No tienes permisos para eliminar este recurso. Solo el propietario o un moderador puede hacerlo.' });
      return;
    }

    await prisma.aporte.delete({
      where: { id: aporteId }
    });

    res.status(200).json({ mensaje: 'Aporte eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
>>>>>>> main
