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
  providedIn: 'root'
})
export class Auth {
  private apiUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  registrar(email: string, password: string): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(
      `${this.apiUrl}/register`,
      {
        email,
        password
      }
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
  const respuesta: LoginResponse = {
    token: 'token-temporal-calimax',
    usuario: {
      id: 1,
      email,
      rol: 'USER'
    }
  };

  return new Observable((observer) => {
    observer.next(respuesta);
    observer.complete();
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