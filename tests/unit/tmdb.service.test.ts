import { jest } from '@jest/globals';
import axios from 'axios';
import { TMDBService } from '../../src/services/tmdb.service.js';

describe('TMDBService (Fase Verde - TDD)', () => {
  let tmdbService: TMDBService;

  beforeEach(() => {
    tmdbService = new TMDBService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería inicializarse correctamente', () => {
    expect(tmdbService).toBeDefined();
  });

  it('busca una película por título y devuelve el ID de TMDB', async () => {
    const get = jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: { results: [{ id: 603, title: 'The Matrix' }] }
    } as never);

    await expect(tmdbService.buscarPeliculaPorTitulo('The Matrix')).resolves.toEqual({
      tmdbId: 603,
      titulo: 'The Matrix'
    });
    expect(new URL(get.mock.calls[0][0] as string).searchParams.get('query')).toBe('The Matrix');
  });

  it('devuelve null cuando TMDB no encuentra películas', async () => {
    jest.spyOn(axios, 'get').mockResolvedValueOnce({
      data: { results: [] }
    } as never);

    await expect(tmdbService.buscarPeliculaPorTitulo('Título inexistente')).resolves.toBeNull();
  });
});
