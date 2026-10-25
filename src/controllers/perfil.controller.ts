import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { actualizarPerfilSchema } from '../schemas/perfil.schema.js';
import { PerfilService } from '../services/perfil.service.js';

const perfilService = new PerfilService();

const obtenerIdUsuario = (req: Request, res: Response): number | null => {
  const userId = Number((req as AuthRequest).user?.userId);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    res.status(401).json({ error: 'No autorizado' });
    return null;
  }
  return userId;
};

export class PerfilController {
  async obtener(req: Request, res: Response): Promise<void> {
    const id = obtenerIdUsuario(req, res);
    if (id === null) return;

    try {
      const perfil = await perfilService.obtener(id);
      if (!perfil) {
        res.status(404).json({ error: 'No se encontró el perfil.' });
        return;
      }
      res.status(200).json({ perfil });
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      res.status(500).json({ error: 'No se pudo cargar el perfil.' });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    const id = obtenerIdUsuario(req, res);
    if (id === null) return;

    const resultado = actualizarPerfilSchema.safeParse(req.body);
    if (!resultado.success) {
      res.status(400).json({
        error: 'Datos de perfil inválidos.',
        detalles: resultado.error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensaje: issue.message,
        })),
      });
      return;
    }

    try {
      const perfil = await perfilService.actualizar(id, resultado.data);
      res.status(200).json({ perfil });
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      res.status(500).json({ error: 'No se pudo actualizar el perfil.' });
    }
  }
}
