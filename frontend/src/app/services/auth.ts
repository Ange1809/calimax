import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Usuario {
  id: string;
  email: string;
  rol: string;
}

interface RegistroResponse {
  id: string;
  email: string;
  rol: string;
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  registrar(
    email: string,
    password: string,
    publisher?: {
      nombrePublico: string;
      enlacesSociales: { plataforma: string; url: string }[];
      enlacesAlojamiento: { plataforma: string; url: string }[];
      aceptaTerminos: true;
    }
  ): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(
      publisher ? `${this.apiUrl}/register/publisher` : `${this.apiUrl}/register`,
      publisher
        ? {
            email,
            password,
            ...publisher
          }
        : {
            email,
            password
          }
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    );
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerRol(): string | null {
    const token = this.obtenerToken();
    const payload = token?.split('.')[1];

    if (!payload) {
      return null;
    }

    try {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const datos: { rol?: unknown } = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
      );
      return typeof datos.rol === 'string' ? datos.rol : null;
    } catch {
      return null;
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }
}
