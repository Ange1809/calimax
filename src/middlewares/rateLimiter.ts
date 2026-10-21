import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.'
  }
});

export const reportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Has alcanzado el límite de reportes permitidos. Intenta nuevamente en 15 minutos.'
  }
});