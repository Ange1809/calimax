import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const publisherGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.obtenerRol() === 'PUBLISHER') {
    return true;
  }

  return router.createUrlTree([auth.obtenerToken() ? '/home' : '/login']);
};
