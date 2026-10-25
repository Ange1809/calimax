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
    const id = decoded.userId ?? decoded.id;
    const userId =
      typeof id === 'number' && Number.isSafeInteger(id) && id > 0
        ? String(id)
        : typeof id === 'string' && /^[1-9]\d*$/.test(id)
          ? id
          : null;

    if (userId === null || typeof decoded.rol !== 'string') {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = { userId, rol: decoded.rol };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const requerirRol = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Prohibido: Permisos insuficientes' });
    }
    next();
  };
};
