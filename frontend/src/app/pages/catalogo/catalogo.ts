import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  selector: 'app-catalogo',
  imports: [RouterLink],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css'
})
export class Catalogo implements OnInit {
  contenidos: Contenido[] = [];
  tipoActual: 'pelicula' | 'tv' = 'pelicula';
  categoriaActual: 'ultimos' | 'mejores' | 'populares' = 'ultimos';

  paginaActual = 1;
  limite = 20;
  total = 0;
  cargando = true;
  error = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.cargando = true;
    this.error = '';

    this.http.get<CatalogoResponse>(
      `/api/catalogo?tipo=${this.tipoActual}&categoria=${this.categoriaActual}&page=${this.paginaActual}&limit=${this.limite}`
    ).subscribe({
      next: (respuesta) => {
        this.contenidos = respuesta.datos;
        this.total = respuesta.total;
        this.paginaActual = respuesta.paginaActual;
        this.limite = respuesta.limite;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el catálogo:', error);
        this.error = 'No se pudo cargar el catálogo.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarTipo(tipo: 'pelicula' | 'tv'): void {
    this.tipoActual = tipo;
    this.paginaActual = 1;
    this.cargarCatalogo();
  }

  cambiarCategoria(categoria: 'ultimos' | 'mejores' | 'populares'): void {
    this.categoriaActual = categoria;
    this.paginaActual = 1;
    this.cargarCatalogo();
  }

  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarCatalogo();
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarCatalogo();
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.total / this.limite);
  }
}