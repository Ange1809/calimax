import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

interface Contenido {
  id: number;
  tmdbId: string;
  tipo: string;
  estado: string;
  poster?: string;
  titulo?: string;
  anio?: string;
}

interface CatalogoResponse {
  datos: Contenido[];
  total: number;
  paginaActual: number;
  limite: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  recomendaciones: Contenido[] = [];
  cargando = true;

  constructor(
    private auth: Auth,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarRecomendaciones();
  }

  cargarRecomendaciones(): void {
    this.cargando = true;

    this.http.get<CatalogoResponse>(
      '/api/catalogo?tipo=pelicula&categoria=populares&page=1&limit=2'
    ).subscribe({
      next: (peliculas) => {
        this.http.get<CatalogoResponse>(
          '/api/catalogo?tipo=tv&categoria=populares&page=1&limit=2'
        ).subscribe({
          next: (series) => {
            this.recomendaciones = [
              ...peliculas.datos,
              ...series.datos
            ];

            this.cargando = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al cargar las series:', error);
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar las películas:', error);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}