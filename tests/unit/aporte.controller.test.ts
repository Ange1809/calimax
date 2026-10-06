import { jest } from '@jest/globals';
import type { PrismaClient } from '@prisma/client';
import { AporteController } from '../../src/controllers/aporte.controller.js';
import type { TMDBService } from '../../src/services/tmdb.service.js';

describe('AporteController', () => {
  it('sigue aceptando el ID de TMDB directamente', async () => {
    const create = jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: 'aporte-1' });
    const database = {
      aporte: { create, update: jest.fn() }
    } as unknown as Pick<PrismaClient, 'aporte'>;
    const buscarPeliculaPorTitulo = jest.fn<
      (titulo: string) => Promise<{ tmdbId: number; titulo: string } | null>
    >();
    const tmdbService = { buscarPeliculaPorTitulo } as unknown as Pick<
      TMDBService,
      'buscarPeliculaPorTitulo'
    >;
    const controller = new AporteController(database, tmdbService);
    const req: any = {
      body: { tmdbId: '603', enlaces: [] },
      user: { userId: 'usuario-1' }
    };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.crearAporte(req, res);

    expect(buscarPeliculaPorTitulo).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tmdbId: '603' })
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('acepta el título de una película y guarda el ID resuelto por TMDB', async () => {
    const create = jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({ id: 'aporte-1' });
    const database = {
      aporte: { create, update: jest.fn() }
    } as unknown as Pick<PrismaClient, 'aporte'>;
    const buscarPeliculaPorTitulo = jest.fn<
      (titulo: string) => Promise<{ tmdbId: number; titulo: string } | null>
    >().mockResolvedValue({
      tmdbId: 603,
      titulo: 'The Matrix'
    });
    const tmdbService = { buscarPeliculaPorTitulo } as unknown as Pick<
      TMDBService,
      'buscarPeliculaPorTitulo'
    >;
    const controller = new AporteController(database, tmdbService);
    const req: any = {
      body: { titulo: 'The Matrix', enlaces: [{ url: 'https://example.com', servidor: 'WEB' }] },
      user: { userId: 'usuario-1' }
    };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.crearAporte(req, res);

    expect(buscarPeliculaPorTitulo).toHaveBeenCalledWith('The Matrix');
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        tmdbId: '603',
        titulo: 'The Matrix',
        tipo: 'pelicula',
        usuarioId: 'usuario-1'
      })
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('devuelve 404 y no crea el aporte cuando TMDB no encuentra el título', async () => {
    const create = jest.fn();
    const database = {
      aporte: { create, update: jest.fn() }
    } as unknown as Pick<PrismaClient, 'aporte'>;
    const tmdbService = {
      buscarPeliculaPorTitulo: jest.fn<
        (titulo: string) => Promise<{ tmdbId: number; titulo: string } | null>
      >().mockResolvedValue(null)
    } as unknown as Pick<TMDBService, 'buscarPeliculaPorTitulo'>;
    const controller = new AporteController(database, tmdbService);
    const req: any = {
      body: { titulo: 'Título inexistente', enlaces: [] },
      user: { userId: 'usuario-1' }
    };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await controller.crearAporte(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(create).not.toHaveBeenCalled();
  });
});