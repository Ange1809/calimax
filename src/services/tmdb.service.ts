import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 43200 });

export interface TMDBResponse {
  tmdbId: number;
  titulo: string;
  sinopsis: string;
  url_poster: string;
  fecha_lanzamiento: string;
  generos: string[];
  elenco: string[];
  es_envivo: boolean;
}

export class TMDBService {
  async buscarPeliculaPorTitulo(
    titulo: string
  ): Promise<{ tmdbId: number; titulo: string } | null> {
    const params = new URLSearchParams({
      api_key: process.env.TMDB_API_KEY || 'test_key',
      language: 'es-MX',
      query: titulo.trim()
    });

    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?${params.toString()}`
      );
      const pelicula = response.data.results?.[0];

      if (!pelicula) {
        return null;
      }

      return {
        tmdbId: pelicula.id,
        titulo: pelicula.title
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error('Error al conectar con TMDB');
    }
  }

  async obtenerMetadata(tipo: string, id: string): Promise<TMDBResponse | null> {
    const cacheKey = `tmdb_${tipo}_${id}`;
    
    const cachedData = cache.get<TMDBResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const API_KEY = process.env.TMDB_API_KEY || 'test_key';
      const tmdbEndpoint = tipo === 'tv' ? 'tv' : 'movie';
      
      // Agregamos &append_to_response=credits para traer a los actores sin hacer doble petición
      const url = `https://api.themoviedb.org/3/${tmdbEndpoint}/${id}?api_key=${API_KEY}&language=es-MX&append_to_response=credits`;
      
      const response = await axios.get(url);
      const data = response.data;

      // Mapear los géneros
      const generos = data.genres ? data.genres.map((g: any) => g.name) : [];
      
      // Mapear el elenco (tomamos los primeros 10 actores)
      const elenco = data.credits && data.credits.cast 
        ? data.credits.cast.slice(0, 10).map((actor: any) => actor.name) 
        : [];

      const dto: TMDBResponse = {
        tmdbId: data.id,
        titulo: tipo === 'tv' ? data.name : data.title,
        sinopsis: data.overview,
        url_poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        fecha_lanzamiento: tipo === 'tv' ? data.first_air_date : data.release_date,
        generos: generos,
        elenco: elenco,
        es_envivo: tipo === 'tv' // Si es de TV lo marcamos como posible transmisión en vivo (M3U8)
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
