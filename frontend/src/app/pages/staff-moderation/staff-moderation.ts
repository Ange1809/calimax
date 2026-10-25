import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

interface ModerationLink {
  url: string;
  servidor: string;
}

interface PendingContribution {
  id: number;
  tmdbId: string;
  titulo: string | null;
  tipo: string;
  createdAt: string;
  enlaces: ModerationLink[];
  usuario: {
    id: number;
    nombrePublico: string | null;
    publisherLinks: { plataforma: string; url: string }[];
  };
}

@Component({
  selector: 'app-staff-moderation',
  imports: [FormsModule, RouterLink],
  templateUrl: './staff-moderation.html',
  styleUrl: './staff-moderation.css'
})
export class StaffModeration implements OnInit {
  readonly esAdmin: boolean;
  aportes: PendingContribution[] = [];
  calidades: Record<number, number> = {};
  comentarios: Record<number, string> = {};
  cargando = true;
  error = '';
  mensaje = '';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ) {
    this.esAdmin = auth.obtenerRol() === 'ADMIN';
  }

  ngOnInit(): void {
    this.cargarPendientes();
  }

  cargarPendientes(): void {
    this.cargando = true;
    this.error = '';
    this.http.get<{ datos: PendingContribution[] }>('/api/moderacion/pendientes').subscribe({
      next: (respuesta) => {
        this.aportes = respuesta.datos;
        this.cargando = false;
      },
      error: (response: HttpErrorResponse) => {
        console.error('Error al cargar la bandeja de moderación:', response);
        this.error = response.status === 403
          ? 'Tu cuenta no tiene permisos de moderación.'
          : 'No se pudo cargar la bandeja. Intentá nuevamente.';
        this.cargando = false;
      }
    });
  }

  resolver(aporte: PendingContribution, estado: 'PUBLICADO' | 'RECHAZADO'): void {
    this.error = '';
    this.mensaje = '';
    this.http.patch(`/api/moderacion/${aporte.id}/estado`, {
      estado,
      comentario: this.comentarios[aporte.id] ?? '',
      ...(estado === 'PUBLICADO' ? { calidad: Number(this.calidades[aporte.id] ?? 3) } : {})
    }).subscribe({
      next: () => {
        this.mensaje = estado === 'PUBLICADO'
          ? 'Contenido aprobado y publicado.'
          : 'Contenido rechazado.';
        this.aportes = this.aportes.filter((item) => item.id !== aporte.id);
      },
      error: (response: HttpErrorResponse) => {
        console.error('Error al guardar la revisión:', response);
        this.error = response.status === 409
          ? 'Otro moderador ya revisó este aporte. Actualizá la bandeja.'
          : 'No se pudo guardar la revisión.';
      }
    });
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
