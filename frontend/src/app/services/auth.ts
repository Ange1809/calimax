import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Usuario {
  id: number;
  email: string;
  rol: string;
}

interface RegistroResponse {
  id: number;
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

  registrar(email: string, password: string): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.apiUrl}/register`, {
      email,
      password,
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password,
    });
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }
}
