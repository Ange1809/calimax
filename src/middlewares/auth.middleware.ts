import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: string; rol: string };
}

export const verificarJWT = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as jwt.JwtPayload;
    if (typeof decoded.id !== 'string' || typeof decoded.rol !== 'string') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = { userId: decoded.id, rol: decoded.rol };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const requerirRol = (role: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || req.user.rol !== role) {
      return res.status(403).json({ error: 'Prohibido: Permisos insuficientes' });
    }
    next();
  };
};
