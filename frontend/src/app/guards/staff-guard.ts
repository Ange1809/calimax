import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const staffGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const rol = auth.obtenerRol();

  if (rol === 'MODERATOR' || rol === 'ADMIN') {
    return true;
  }

  return router.createUrlTree([auth.obtenerToken() ? '/home' : '/login']);
};
