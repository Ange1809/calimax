import { Response } from 'express';
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
