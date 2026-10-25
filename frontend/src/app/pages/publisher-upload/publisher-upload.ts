import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

interface EnlaceAporte {
  url: string;
  servidor: string;
}

@Component({
  selector: 'app-publisher-upload',
  imports: [FormsModule],
  templateUrl: './publisher-upload.html',
  styleUrl: './publisher-upload.css'
})
export class PublisherUpload {
  tmdbId = '';
  titulo = '';
  tipo: 'pelicula' | 'tv' = 'pelicula';
  enlaces: EnlaceAporte[] = [{ url: '', servidor: '' }];
  enviando = false;
  mensaje = '';
  error = '';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private router: Router
  ) {}

  enviarAporte(): void {
    this.mensaje = '';
    this.error = '';

    if (this.tipo === 'tv' && !this.tmdbId.trim()) {
      this.error = 'Para enviar una serie, ingresá su ID de TMDB.';
      return;
    }

    if (!this.tmdbId.trim() && !this.titulo.trim()) {
      this.error = 'Ingresá el ID de TMDB o el título de la película.';
      return;
    }

    this.enviando = true;

    this.http.post('/api/aportes', {
      tmdbId: this.tmdbId.trim() || undefined,
      titulo: this.titulo.trim() || undefined,
      tipo: this.tipo,
      enlaces: this.enlaces
    }).subscribe({
      next: () => {
        this.mensaje = 'Aporte enviado. Quedó pendiente de moderación.';
        this.tmdbId = '';
        this.titulo = '';
        this.enlaces = [{ url: '', servidor: '' }];
        this.enviando = false;
      },
      error: (response: HttpErrorResponse) => {
        console.error('Error al enviar el aporte:', response);
        this.error = response.status === 401
          ? 'Tu sesión venció. Iniciá sesión nuevamente.'
          : response.status === 403
            ? 'Solo una cuenta Publisher puede enviar aportes.'
            : response.status === 404
              ? 'No se encontró ese título en TMDB. Revisá el nombre o ingresá su ID.'
              : response.status === 400
                ? 'Completá un ID o título y todos los enlaces requeridos.'
                : 'No se pudo enviar el aporte. Intentá nuevamente.';
        this.enviando = false;
      }
    });
  }

  agregarEnlace(): void {
    if (this.enlaces.length < 10) {
      this.enlaces.push({ url: '', servidor: '' });
    }
  }

  quitarEnlace(index: number): void {
    if (this.enlaces.length > 1) {
      this.enlaces.splice(index, 1);
    }
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
