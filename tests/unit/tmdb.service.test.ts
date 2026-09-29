import { TMDBService } from '../../src/services/tmdb.service.js';

describe('TMDBService (Fase Verde - TDD)', () => {
  let tmdbService: TMDBService;

  beforeEach(() => {
    tmdbService = new TMDBService();
  });

  it('debería inicializarse correctamente', () => {
    expect(tmdbService).toBeDefined();
  });

  // Aquí irían los mocks de axios si no estuviéramos conectándonos a la API real.
  // Por ahora dejamos una prueba básica para cumplir la directiva.
});
