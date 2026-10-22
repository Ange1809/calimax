import { Router } from 'express';
import { getCatalogo, reportarEnlace } from '../controllers/catalogo.controller.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has alcanzado el límite de reportes permitidos. Intenta nuevamente en 15 minutos.' }
});

router.get('/', getCatalogo);
router.post('/enlaces/:linkId/reportar', reportLimiter, reportarEnlace);

export default router;