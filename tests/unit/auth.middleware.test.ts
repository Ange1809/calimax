import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { verificarJWT } from '../../src/middlewares/auth.middleware.js';

describe('verificarJWT', () => {
  const secretAnterior = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    if (secretAnterior === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = secretAnterior;
    }
  });

  it('mapea el ID del JWT al userId usado por la aplicación', () => {
    const userId = '123';
    const token = jwt.sign({ id: userId, rol: 'USER' }, 'test-secret');
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verificarJWT(req, res, next);

    expect(req.user).toEqual({ userId, rol: 'USER' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rechaza un JWT con nombre pero sin ID', () => {
    const token = jwt.sign({ nombre: 'Mauro', rol: 'USER' }, 'test-secret');
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    verificarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });
});