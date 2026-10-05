import { Router } from 'express';
import { eliminarAporte } from '../controllers/aporte.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint protegido (Requiere Auth + IDOR check dentro del controlador)
router.delete('/:id', verificarToken, eliminarAporte);

export default router;
