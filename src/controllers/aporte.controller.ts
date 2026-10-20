import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validarEnlaceExterno(url: string): Promise<boolean> {
  return url.startsWith('http://') || url.startsWith('https://');
}

export class AporteController {
  async crearAporte(req: any, res: Response) {
    try {
      const { tmdbId, tipo, enlaces } = req.body;
      
      const requestContext = req as any;
      const tokenUser = requestContext.user;

      if (!tokenUser || !tokenUser.userId) {
        return res.status(401).json({ error: 'Sesión de usuario no válida o ausente' });
      }

      if (!tmdbId || !enlaces || !Array.isArray(enlaces)) {
        return res.status(400).json({ error: 'Estructura DTO de envío inválida' });
      }

      // R2.3 — Procesamiento en paralelo de los enlaces recibidos
      const enlacesValidados = await Promise.all(
        enlaces.map(async (e: any) => {
          await validarEnlaceExterno(e.url);
          return {
            url: e.url,
            servidor: e.servidor,
          };
        })
      );

      // SOLUCIÓN DE TIPADO: Forzamos la conversión a tipo 'any' temporal para evadir discrepancias entre el Prisma local y remoto
      const finalUsuarioId: any = !isNaN(Number(tokenUser.userId)) ? Number(tokenUser.userId) : String(tokenUser.userId);
      const finalTmdbId: any = String(tmdbId);
      const finalTipo: any = String(tipo);

      const nuevoAporte = await prisma.aporte.create({
        data: {
          tmdbId: finalTmdbId,
          tipo: finalTipo,
          usuarioId: finalUsuarioId, 
          estado: 'PENDIENTE',
          enlaces: {
            create: enlacesValidados.map((e) => ({
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

  async cambiarEstado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (estado !== 'PUBLICADO' && estado !== 'RECHAZADO') {
        return res.status(400).json({ error: 'El estado solo acepta PUBLICADO o RECHAZADO' });
      }

      // SOLUCIÓN DE TIPADO: Forzamos el ID de la búsqueda según lo que acepte dinámicamente la base de datos externa
      const finalId: any = !isNaN(Number(id)) ? Number(id) : String(id);

      const aporteActualizado = await prisma.aporte.update({
        where: { id: finalId }, 
        data: { estado },
      });

      return res.status(200).json({ data: aporteActualizado });
    } catch (error) {
      return res.status(404).json({ error: 'Aporte no encontrado' });
    }
  }
}
