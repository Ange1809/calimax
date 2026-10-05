import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [ RouterLink ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}