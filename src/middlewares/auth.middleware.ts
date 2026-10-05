<<<<<<< HEAD
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'calimax_secreto_super_seguro_2026';

// Middleware de autenticación general (Valida la sesión)
export const verificarJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Extraemos el token limpio

  try {
    const decoded = jwt.verify(token, SECRET) as { userId: string; rol: string };
    (req as any).user = decoded; // Adjuntamos los datos decodificados a la solicitud
    next(); 
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Middleware de autorización por roles (Ejercicios 1, 2 y 3)
export const requerirRol = (rolRequerido: 'USER' | 'MODERATOR') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const usuario = (req as any).user;

    if (!usuario || usuario.rol !== rolRequerido) {
      res.status(403).json({ error: `Acceso prohibido. Se requiere rango de ${rolRequerido}.` });
      return;
    }

=======
﻿import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuario?: { id: number, rol: string };
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso denegado. Token no proporcionado o formato inválido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number, rol: string };
    req.usuario = payload; 
    next(); 
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const requerirRol = (rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({ error: 'No tienes los permisos necesarios para esta acción.' });
      return;
    }
>>>>>>> main
    next();
  };
};
