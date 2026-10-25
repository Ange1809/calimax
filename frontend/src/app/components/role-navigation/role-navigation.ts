import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-role-navigation',
  imports: [RouterLink],
  templateUrl: './role-navigation.html',
  styleUrl: './role-navigation.css'
})
export class RoleNavigation implements OnInit, OnDestroy {
  autenticado = false;
  rol: string | null = null;
  private navigationSubscription?: Subscription;

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {
    this.actualizarSesion();
    this.navigationSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.actualizarSesion());
  }

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.actualizarSesion();
    void this.router.navigate(['/login']);
  }

  get esEquipo(): boolean {
    return this.rol === 'MODERATOR' || this.rol === 'ADMIN';
  }

  get etiquetaRol(): string {
    switch (this.rol) {
      case 'PUBLISHER': return 'Publisher';
      case 'MODERATOR': return 'Moderador';
      case 'ADMIN': return 'Admin';
      default: return 'Usuario';
    }
  }

  private actualizarSesion(): void {
    this.rol = this.auth.obtenerRol();
    this.autenticado = this.auth.obtenerToken() !== null;
  }
}
