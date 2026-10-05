import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  email = '';
  password = '';
  confirmPassword = '';

  mensaje = '';
  error = '';

  constructor(private auth: Auth) {}

  registrar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.auth.registrar(this.email, this.password).subscribe({
      next: (respuesta) => {
        console.log('Usuario registrado:', respuesta);
        this.mensaje = 'Cuenta creada correctamente.';
      },
      error: (error) => {
        console.error('Error al registrar:', error);

        if (error.status === 409) {
          this.error = 'El correo electrónico ya está registrado.';
        } else if (error.status === 400) {
          this.error = 'Revisá los datos ingresados.';
        } else {
          this.error = 'No se pudo crear la cuenta.';
        }
      }
    });
  }
}