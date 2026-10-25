import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Home } from './pages/home/home';
import { authGuard } from './guards/auth-guard';
import { publisherGuard } from './guards/publisher-guard';
import { staffGuard } from './guards/staff-guard';
import { Catalogo } from './pages/catalogo/catalogo';
import { Detalle } from './pages/detalle/detalle';
import { PublisherUpload } from './pages/publisher-upload/publisher-upload';
import { StaffModeration } from './pages/staff-moderation/staff-moderation';
import { PublicBoard } from './pages/public-board/public-board';
import { PublicPublisher } from './pages/public-publisher/public-publisher';
import { Profile } from './pages/profile/profile';

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
    path: 'publisher/login',
    redirectTo: 'login'
  },
  {
    path: 'publisher/register',
    component: Register,
    data: { tipoCuenta: 'PUBLISHER' }
  },
  {
    path: 'staff/login',
    redirectTo: 'login'
  },
  {
    path: 'publisher/upload',
    component: PublisherUpload,
    canActivate: [authGuard, publisherGuard]
  },
  {
    path: 'staff/moderation',
    component: StaffModeration,
    canActivate: [authGuard, staffGuard]
  },
  {
    path: 'perfil',
    component: Profile,
    canActivate: [authGuard]
  },
  {
    path: 'cartelera',
    component: PublicBoard
  },
  {
    path: 'publishers/:id',
    component: PublicPublisher
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