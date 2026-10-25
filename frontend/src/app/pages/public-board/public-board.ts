import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface CarteleraItem {
  id: number;
  tmdbId: string;
  titulo: string | null;
  tipo: string;
  publicadoEn: string;
  enlaces: { id: number; url: string; servidor: string }[];
  publisher: {
    id: number;
    nombrePublico: string | null;
    fotoPerfilUrl: string | null;
    puntosAporte: number;
    calidadPromedio: number | null;
    activoDiariamente: boolean;
    redes: { plataforma: string; url: string }[];
  };
}

@Component({
  selector: 'app-public-board',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './public-board.html',
  styleUrl: './public-board.css'
})
export class PublicBoard implements OnInit {
  items: CarteleraItem[] = [];
  cargando = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<{ datos: CarteleraItem[] }>('/api/publishers/cartelera').subscribe({
      next: ({ datos }) => {
        this.items = datos;
        this.cargando = false;
      },
      error: (response: HttpErrorResponse) => {
        console.error('Error al cargar cartelera:', response);
        this.error = 'No se pudo cargar la cartelera. Intentá nuevamente.';
        this.cargando = false;
      }
    });
  }
}
