import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface PublicProfile {
  id: number;
  nombrePublico: string | null;
  fotoPerfilUrl: string | null;
  biografia: string | null;
  puntosAporte: number;
  calidadPromedio: number | null;
  activoDiariamente: boolean;
  redes: { plataforma: string; url: string }[];
  aportes: {
    id: number;
    tmdbId: string;
    titulo: string | null;
    tipo: string;
    updatedAt: string;
    enlaces: { id: number; url: string; servidor: string }[];
  }[];
}

@Component({
  selector: 'app-public-publisher',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './public-publisher.html',
  styleUrl: './public-publisher.css'
})
export class PublicPublisher implements OnInit {
  perfil: PublicProfile | null = null;
  error = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<{ perfil: PublicProfile }>(`/api/publishers/${encodeURIComponent(id ?? '')}`).subscribe({
      next: ({ perfil }) => this.perfil = perfil,
      error: (response: HttpErrorResponse) => {
        console.error('Error al cargar perfil público:', response);
        this.error = response.status === 404
          ? 'No se encontró ese perfil Publisher.'
          : 'No se pudo cargar el perfil.';
      }
    });
  }
}
