import { Request, Response } from 'express';
import { PrismaClient, EstadoAporte } from '@prisma/client'; // <-- Importamos el Enum nativo generado

const prisma = new PrismaClient();

export class AporteController {
  // Crear un aporte con sus respectivos enlaces vinculados (US5)
  async crearAporte(req: any, res: Response) {
    try {
      const { tmdbId, enlaces } = req.body;
      const usuarioId = req.user?.userId; // Extraído de forma segura desde el JWT decodificado

      if (!tmdbId || !enlaces || !Array.isArray(enlaces)) {
        return res.status(400).json({ error: 'Estructura DTO de envío inválida' });
      }

      if (!usuarioId) {
        return res.status(401).json({ error: 'Sesión de usuario no válida o ausente' });
      }

      const nuevoAporte = await prisma.aporte.create({
        data: {
tmdbId: parseInt(tmdbId, 10) as any as string, // <-- Solución para obligar al editor a aceptar el Int
          usuarioId: String(usuarioId),
          estado: EstadoAporte.PENDIENTE, // <-- Usamos el Enum tipado oficial
          enlaces: {
            create: enlaces.map((e: any) => ({
              url: String(e.url),
              servidor: String(e.servidor),
             estado: 'PENDIENTE' as any

            })),
          },
        },
        include: { enlaces: true }
      });

      return res.status(201).json({ data: nuevoAporte });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al procesar el aporte en la base de datos' });
    }
  }

  // Cambiar el estado del aporte (Panel de Moderación - US6)
  async cambiarEstado(req: Request, res: Response) {
    try {
      const { id } = req.params; // ID del aporte (UUID String)
      const { estado } = req.body;

      if (estado !== 'PUBLICADO' && estado !== 'RECHAZADO' && estado !== 'REVISION') {
        return res.status(400).json({ error: 'El estado solo acepta PUBLICADO, RECHAZADO o REVISION' });
      }

      const aporteActualizado = await prisma.aporte.update({
        where: { id: String(id) },
        data: { estado: estado as EstadoAporte }, // <-- Forzamos el casteo al Enum de Prisma
      });

      return res.status(200).json({ data: aporteActualizado });
    } catch (error) {
      return res.status(404).json({ error: 'Aporte no encontrado' });
    }
  }
}
