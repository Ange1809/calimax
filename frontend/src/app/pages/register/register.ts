import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

interface PublisherLinkInput {
  plataforma: string;
  url: string;
}

interface ValidationIssue {
  campo: string;
  mensaje: string;
}

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  readonly publisher: boolean;
  nombrePublico = '';
  email = '';
  password = '';
  confirmPassword = '';
  aceptaTerminos = false;
  enlacesSociales: PublisherLinkInput[] = [{ plataforma: 'Discord', url: '' }];
  enlacesAlojamiento: PublisherLinkInput[] = [];

  mensaje = '';
  error = '';
  enviando = false;

  constructor(private auth: Auth, route: ActivatedRoute) {
    this.publisher = route.snapshot.data['tipoCuenta'] === 'PUBLISHER';
  }

  registrar(): void {
    this.mensaje = '';
    this.error = '';

    if (this.email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.error = 'Ingresá un correo electrónico válido.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.publisher && this.nombrePublico.trim().length < 2) {
      this.error = 'El nombre público debe tener al menos 2 caracteres.';
      return;
    }

    if (this.publisher && !this.aceptaTerminos) {
      this.error = 'Debés aceptar los términos para crear una cuenta Publisher.';
      return;
    }

    if (this.publisher) {
      const enlacesIngresados = this.enlacesSociales.filter(
        (link) => link.plataforma.trim() || link.url.trim()
      );

      if (enlacesIngresados.length === 0) {
        this.error = 'Agregá al menos una red social y su enlace HTTPS.';
        return;
      }
      if (enlacesIngresados.some((link) => !link.plataforma.trim())) {
        this.error = 'Indicá el nombre de cada plataforma social.';
        return;
      }
      if (enlacesIngresados.some((link) => !this.esUrlHttpsValida(link.url))) {
        this.error = 'Cada red social debe tener una URL HTTPS válida (por ejemplo, https://instagram.com/tu_perfil).';
        return;
      }
      if (this.enlacesAlojamiento.some(
        (link) => (link.plataforma.trim() || link.url.trim()) &&
          (!link.plataforma.trim() || !this.esUrlHttpsValida(link.url))
      )) {
        this.error = 'Completá plataforma y URL HTTPS en cada perfil de contenido, o quitá los campos vacíos.';
        return;
      }
    }

    const datosPublisher = this.publisher
      ? {
          nombrePublico: this.nombrePublico,
          aceptaTerminos: true as const,
          enlacesSociales: this.enlacesSociales.filter(
            (link) => link.plataforma.trim() && link.url.trim()
          ),
          enlacesAlojamiento: this.enlacesAlojamiento.filter(
            (link) => link.plataforma.trim() !== '' && link.url.trim() !== ''
          )
        }
      : undefined;

    this.enviando = true;
    this.auth.registrar(this.email, this.password, datosPublisher).subscribe({
      next: () => {
        this.mensaje = this.publisher
          ? 'Cuenta Publisher creada correctamente.'
          : 'Cuenta creada correctamente.';
        this.enviando = false;
      },
      error: (error) => {
        if (error.status === 409) {
          this.error = 'El correo electrónico ya está registrado.';
        } else if (error.status === 400) {
          const detalles: ValidationIssue[] = error.error?.detalles ?? [];
          this.error = detalles.length > 0
            ? detalles.map(({ campo, mensaje }) => `${this.nombreCampo(campo)}: ${mensaje}`).join(' ')
            : error.error?.error ?? 'Revisá los datos ingresados.';
        } else if (error.status === 0) {
          this.error = 'No se pudo conectar con el servidor. Verificá que la API esté iniciada e intentá nuevamente.';
        } else if (error.status === 429) {
          this.error = 'Se alcanzó el límite de intentos. Esperá unos minutos antes de volver a intentar.';
        } else if (error.status >= 500) {
          this.error = 'El servidor tuvo un problema al crear la cuenta. Intentá más tarde.';
        } else {
          this.error = error.error?.error ?? 'No se pudo crear la cuenta. Revisá los datos e intentá nuevamente.';
        }
        this.enviando = false;
      }
    });
  }

  private esUrlHttpsValida(url: string): boolean {
    try {
      return new URL(url).protocol === 'https:';
    } catch {
      return false;
    }
  }

  private nombreCampo(campo: string): string {
    const nombres: Record<string, string> = {
      email: 'Correo',
      password: 'Contraseña',
      nombrePublico: 'Nombre público',
      aceptaTerminos: 'Términos',
      enlacesSociales: 'Redes sociales',
      enlacesAlojamiento: 'Perfiles de contenido',
      'enlacesSociales.0.plataforma': 'Red social',
      'enlacesSociales.0.url': 'URL social',
    };
    return nombres[campo] ?? campo;
  }

  agregarEnlaceSocial(): void {
    if (this.enlacesSociales.length < 10) {
      this.enlacesSociales.push({ plataforma: '', url: '' });
    }
  }

  quitarEnlaceSocial(index: number): void {
    if (this.enlacesSociales.length > 1) {
      this.enlacesSociales.splice(index, 1);
    }
  }

  agregarEnlaceAlojamiento(): void {
    if (this.enlacesAlojamiento.length < 10) {
      this.enlacesAlojamiento.push({ plataforma: '', url: '' });
    }
  }

  quitarEnlaceAlojamiento(index: number): void {
    this.enlacesAlojamiento.splice(index, 1);
  }
}