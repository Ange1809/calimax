import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';

  mensaje = '';
  error = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  iniciarSesion(): void {
    this.mensaje = '';
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      next: (respuesta) => {
        this.auth.guardarToken(respuesta.token);
        this.mensaje = 'Inicio de sesión exitoso.';

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 500);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);

        if (error.status === 401) {
          this.error = 'El correo o la contraseña son incorrectos.';
        } else if (error.status === 400) {
          this.error = 'Revisá los datos ingresados.';
        } else {
          this.error = 'No se pudo iniciar sesión.';
        }
      }
    });
  }
}