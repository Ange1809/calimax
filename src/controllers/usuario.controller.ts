import { Request, Response } from 'express';
import { z } from 'zod';
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
    console.error("[CRASH INTERNO EN REGISTRO]:", error);
    if (error instanceof EmailAlreadyRegisteredError) {
      res.status(409).json({ error: 'Conflict' });
      return;
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Esquema especÃ­fico para login (no requiere tantas reglas como el registro)
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'Bad Request' });
      return;
    }

    const resultado = await usuarioService.login(parsed.data);

    res.status(200).json(resultado);
  } catch (error: any) {
    if (error.message === "CREDENCIALES_INVALIDAS") {
      res.status(401).json({ error: 'Email o contraseÃ±a incorrectos' });
      return;
    }
    console.error("[CRASH INTERNO EN LOGIN]:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ error: 'Refresh token es requerido' });
    return;
  }

  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!);
    
    // Generar un nuevo Access Token
    const nuevoToken = jwt.sign(
      { id: payload.id, rol: payload.rol },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );
    
    res.status(200).json({ token: nuevoToken });
  } catch (error) {
    res.status(403).json({ error: 'Refresh token inválido o expirado' });
  }
};
