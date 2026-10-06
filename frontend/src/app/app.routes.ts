import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { authGuard } from './guards/auth-guard';
import { Catalogo } from './pages/catalogo/catalogo';
import { Detalle } from './pages/detalle/detalle';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
  path: 'home',
  component: Home,
  canActivate: [authGuard]
  },
  {
  path: 'catalogo',
  component: Catalogo,
  canActivate: [authGuard]
  },
  {
  path: 'detalle/:tipo/:id',
  component: Detalle,
  canActivate: [authGuard]
}
];