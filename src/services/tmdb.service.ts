import axios from 'axios';
import NodeCache from 'node-cache';

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
    const cacheKey = `tmdb_${id}`;
    
    const cachedData = cache.get<TMDBResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const API_KEY = process.env.TMDB_API_KEY || 'test_key';
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-MX`;
      
      const response = await axios.get(url);
      const data = response.data;

      const dto: TMDBResponse = {
        tmdbId: data.id,
        titulo: data.title,
        sinopsis: data.overview,
        url_poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        fecha_lanzamiento: data.release_date,
      };

      cache.set(cacheKey, dto);
      return dto;
      
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error('Error al conectar con TMDB');
    }
  }
}
