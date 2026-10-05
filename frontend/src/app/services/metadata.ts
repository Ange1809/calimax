import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Metadata {
  tmdbId: string;
  titulo: string;
  sinopsis: string;
  url_poster: string;
  fecha_lanzamiento: string;
  generos: string[];
  elenco: string[];
  es_envivo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Metadata {
  private apiUrl = '/api/metadata/tmdb';

  constructor(private http: HttpClient) {}

  obtenerPelicula(id: string): Observable<Metadata> {
    return this.http.get<Metadata>(
      `${this.apiUrl}/pelicula/${id}`
    );
  }

  obtenerSerie(id: string): Observable<Metadata> {
    return this.http.get<Metadata>(
      `${this.apiUrl}/tv/${id}`
    );
  }
}