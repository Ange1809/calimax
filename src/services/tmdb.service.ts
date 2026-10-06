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

export interface TMDBCatalogoItem {
  tmdbId: number;
  titulo: string;
  url_poster: string;
  fecha_lanzamiento: string;
  tipo: 'pelicula' | 'tv';
}

export class TMDBService {
  async obtenerMetadata(tipo: string, id: string): Promise<TMDBResponse | null> {
    const cacheKey = `tmdb_${tipo}_${id}`;

    const cachedData = cache.get<TMDBResponse>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const API_KEY = process.env.TMDB_API_KEY || 'test_key';
      const tmdbEndpoint = tipo === 'tv' ? 'tv' : 'movie';

      const url = `https://api.themoviedb.org/3/${tmdbEndpoint}/${id}?api_key=${API_KEY}&language=es-MX&append_to_response=credits`;

      const response = await axios.get(url);
      const data = response.data;

      const generos = data.genres ? data.genres.map((g: any) => g.name) : [];

      const elenco = data.credits && data.credits.cast
        ? data.credits.cast.slice(0, 10).map((actor: any) => actor.name)
        : [];

      const dto: TMDBResponse = {
        tmdbId: data.id,
        titulo: tipo === 'tv' ? data.name : data.title,
        sinopsis: data.overview,
        url_poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        fecha_lanzamiento: tipo === 'tv' ? data.first_air_date : data.release_date,
        generos,
        elenco,
        es_envivo: tipo === 'tv'
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

  async obtenerCatalogo(
    tipo: 'pelicula' | 'tv',
    categoria: 'ultimos' | 'mejores' | 'populares',
    pagina: number = 1,
    busqueda: string = ''
  ): Promise<{ datos: TMDBCatalogoItem[]; total: number }> {
    const API_KEY = process.env.TMDB_API_KEY || 'test_key';

    try {
      if (busqueda.trim()) {
        const cacheKey = `tmdb_busqueda_${tipo}_${busqueda.trim().toLowerCase()}_${pagina}`;

        const cachedData = cache.get<{ datos: TMDBCatalogoItem[]; total: number }>(cacheKey);
        if (cachedData) {
          return cachedData;
        }

        const endpoint = tipo === 'tv' ? 'search/tv' : 'search/movie';

        const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&language=es-MX&query=${encodeURIComponent(busqueda.trim())}&page=${pagina}`;

        const response = await axios.get(url);

        const datos = response.data.results.map((item: any) => ({
          tmdbId: item.id,
          titulo: tipo === 'tv' ? item.name : item.title,
          url_poster: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '',
          fecha_lanzamiento: tipo === 'tv'
            ? item.first_air_date
            : item.release_date,
          tipo
        }));

        const resultado = {
          datos,
          total: response.data.total_results
        };

        cache.set(cacheKey, resultado);

        return resultado;
      }

      const cacheKey = `tmdb_catalogo_${tipo}_${categoria}_${pagina}`;

      const cachedData = cache.get<TMDBCatalogoItem[]>(cacheKey);
      if (cachedData) {
        return {
          datos: cachedData,
          total: 100
        };
      }

      let endpoint: string;

      if (tipo === 'pelicula') {
        if (categoria === 'ultimos') {
          endpoint = 'movie/now_playing';
        } else if (categoria === 'mejores') {
          endpoint = 'movie/top_rated';
        } else {
          endpoint = 'movie/popular';
        }
      } else {
        if (categoria === 'ultimos') {
          endpoint = 'tv/on_the_air';
        } else if (categoria === 'mejores') {
          endpoint = 'tv/top_rated';
        } else {
          endpoint = 'tv/popular';
        }
      }

      const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&language=es-MX&page=${pagina}`;

      const response = await axios.get(url);

      const datos = response.data.results.map((item: any) => ({
        tmdbId: item.id,
        titulo: tipo === 'tv' ? item.name : item.title,
        url_poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : '',
        fecha_lanzamiento: tipo === 'tv'
          ? item.first_air_date
          : item.release_date,
        tipo
      }));

      cache.set(cacheKey, datos);

      return {
        datos,
        total: 100
      };
    } catch (error) {
      throw new Error('Error al obtener el catálogo desde TMDB');
    }
  }
}