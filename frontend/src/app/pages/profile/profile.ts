import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TimeoutError, timeout } from 'rxjs';
import { Auth } from '../../services/auth';

interface Perfil {
  id: number;
  email: string;
  rol: string;
  nombrePublico: string | null;
  fotoPerfilUrl: string | null;
  biografia: string | null;
  puntosAporte: number;
  calidadPromedio: number | null;
  publisherLinks: { categoria: string; plataforma: string; url: string }[];
}

@Component({
  selector: 'app-profile',
  imports: [DecimalPipe, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  perfil: Perfil | null = null;
  rol = '';
  nombrePublico = '';
  fotoPerfilUrl = '';
  biografia = '';
  cargando = true;
  guardando = false;
  fotoInvalida = false;
  mensaje = '';
  error = '';

  constructor(private http: HttpClient, private auth: Auth) {}

  ngOnInit(): void {
    this.rol = this.auth.obtenerRol() ?? '';
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.cargando = true;
    this.error = '';
    this.http.get<{ perfil: Perfil }>('/api/perfil')
      .pipe(timeout({ first: 12000 }))
      .subscribe({
        next: ({ perfil }) => {
          this.perfil = perfil;
          this.nombrePublico = perfil.nombrePublico ?? '';
          this.fotoPerfilUrl = perfil.fotoPerfilUrl ?? '';
          this.biografia = perfil.biografia ?? '';
          this.cargando = false;
        },
        error: (response: HttpErrorResponse | TimeoutError) => {
          console.error('Error al cargar el perfil:', response);
          this.error = response instanceof TimeoutError
            ? 'El servidor tardó más de 12 segundos en responder. Revisá la conexión de la API e intentá nuevamente.'
            : response.status === 401
              ? 'Tu sesión venció. Iniciá sesión nuevamente.'
              : 'No se pudo cargar tu perfil. Revisá la conexión de la API e intentá nuevamente.';
          this.cargando = false;
        }
      });
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    const nombre = this.nombrePublico.trim();
    const biografia = this.biografia.trim();
    if (nombre && (nombre.length < 2 || nombre.length > 60)) {
      this.error = 'El nombre público debe tener entre 2 y 60 caracteres.';
      return;
    }
    if (biografia.length > 280) {
      this.error = 'La biografía no puede superar 280 caracteres.';
      return;
    }
    if (this.fotoPerfilUrl.trim() && !this.esUrlHttpsValida(this.fotoPerfilUrl.trim())) {
      this.error = 'La foto debe ser una URL HTTPS válida.';
      return;
    }

    this.guardando = true;
    this.http.patch<{ perfil: Perfil }>('/api/perfil', {
      nombrePublico: nombre,
      biografia,
      fotoPerfilUrl: this.fotoPerfilUrl.trim()
    }).subscribe({
      next: ({ perfil }) => {
        this.perfil = perfil;
        this.nombrePublico = perfil.nombrePublico ?? '';
        this.fotoPerfilUrl = perfil.fotoPerfilUrl ?? '';
        this.biografia = perfil.biografia ?? '';
        this.fotoInvalida = false;
        this.mensaje = 'Tu perfil se actualizó correctamente.';
        this.guardando = false;
      },
      error: (response: HttpErrorResponse) => {
        console.error('Error al actualizar el perfil:', response);
        this.error = response.status === 400
          ? response.error?.detalles?.map((detalle: { mensaje: string }) => detalle.mensaje).join(' ')
            || 'Revisá los datos del perfil.'
          : response.status === 401
            ? 'Tu sesión venció. Iniciá sesión nuevamente.'
            : 'No se pudo guardar el perfil. Intentá nuevamente.';
        this.guardando = false;
      }
    });
  }

  marcarFotoInvalida(): void {
    this.fotoInvalida = true;
  }

  get nombreVisible(): string {
    return this.perfil?.nombrePublico || this.perfil?.email || 'Mi perfil';
  }

  get rolEtiqueta(): string {
    switch (this.rol) {
      case 'PUBLISHER': return 'Publisher';
      case 'MODERATOR': return 'Moderador';
      case 'ADMIN': return 'Admin';
      default: return 'Usuario';
    }
  }

  get redesSociales(): { plataforma: string; url: string }[] {
    return this.perfil?.publisherLinks.filter((link) => link.categoria === 'SOCIAL') ?? [];
  }

  private esUrlHttpsValida(value: string): boolean {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }
}
