import { Request, Response } from 'express';
import { registerUsuarioSchema } from '../schemas/usuario.schema.js';
import {
  EmailAlreadyRegisteredError,
  UsuarioService,
} from '../services/usuario.service.js';

const usuarioService = new UsuarioService();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerUsuarioSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Bad Request' });
      return;
    }

    const usuario = await usuarioService.registrar(parsed.data);

    res.status(201).json(usuario);
  } catch (error: unknown) {
    if (error instanceof EmailAlreadyRegisteredError) {
      res.status(409).json({ error: 'Conflict' });
      return;
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
