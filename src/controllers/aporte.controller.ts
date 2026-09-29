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
