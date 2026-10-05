import { Router } from 'express';
import { AporteController } from '../controllers/aporte.controller.js';
import { verificarJWT, requerirRol } from '../middlewares/auth.middleware.js';

const router = Router();
const aporteController = new AporteController();

// US5: Enviar aportes
router.post('/aportes', verificarJWT, (req, res) => aporteController.crearAporte(req, res));

// US6: Panel de moderación
router.patch('/moderacion/:id/estado', verificarJWT, requerirRol('MODERATOR'), (req, res) => aporteController.cambiarEstado(req, res));

export default router;
