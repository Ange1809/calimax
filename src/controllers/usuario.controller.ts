import { Request, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  registerPublisherSchema,
  registerUsuarioSchema,
} from '../schemas/usuario.schema.js';
import {
  EmailAlreadyRegisteredError,
  UsuarioService,
} from '../services/usuario.service.js';

const usuarioService = new UsuarioService();

const esEmailDuplicado = (error: unknown): boolean =>
  error instanceof EmailAlreadyRegisteredError ||
  (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002');

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerUsuarioSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Datos de registro inválidos',
        detalles: parsed.error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensaje: issue.message,
        })),
      });
      return;
    }

    const usuario = await usuarioService.registrar(parsed.data);

    res.status(201).json(usuario);
  } catch (error: unknown) {
    console.error("[CRASH INTERNO EN REGISTRO]:", error);
    if (esEmailDuplicado(error)) {
      res.status(409).json({ error: 'Conflict' });
      return;
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const registerPublisher = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerPublisherSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'Datos de registro Publisher inválidos',
        detalles: parsed.error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensaje: issue.message,
        })),
      });
      return;
    }

    const usuario = await usuarioService.registrarPublisher(parsed.data);
    res.status(201).json(usuario);
  } catch (error: unknown) {
    console.error('[ERROR INTERNO EN REGISTRO PUBLISHER]:', error);
    if (esEmailDuplicado(error)) {
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

const iniciarSesion = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

export const login = (req: Request, res: Response): Promise<void> =>
  iniciarSesion(req, res);

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
