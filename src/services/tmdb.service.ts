import axios from 'axios';
import NodeCache from 'node-cache';

// Caché con TTL de 12 horas (43200 segundos)
const cache = new NodeCache({ stdTTL: 43200 });

export interface TMDBResponse {
  tmdbId: number;
  titulo: string;
  sinopsis: string;
  url_poster: string;
  fecha_lanzamiento: string;
}

export class TMDBService {
  async obtenerMetadata(id: string): Promise<TMDBResponse | null> {
    const cacheKey = \	mdb_\\;
    
    // 1. Revisar Caché (Historia No Funcional de Rendimiento)
    const cachedData = cache.get<TMDBResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // 2. Si no está en caché, buscar en la API externa
      const API_KEY = process.env.TMDB_API_KEY || 'test_key';
      const url = \https://api.themoviedb.org/3/movie/\?api_key=\&language=es-MX\;
      
      const response = await axios.get(url);
      const data = response.data;

      // 3. Mapear al DTO limpio (Historia Funcional)
      const dto: TMDBResponse = {
        tmdbId: data.id,
        titulo: data.title,
        sinopsis: data.overview,
        url_poster: \https://image.tmdb.org/t/p/w500\\,
        fecha_lanzamiento: data.release_date,
      };

      // Guardar en caché antes de devolver
      cache.set(cacheKey, dto);
      return dto;
      
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null; // Película no encontrada
      }
      throw new Error('Error al conectar con TMDB');
    }
  }
}
