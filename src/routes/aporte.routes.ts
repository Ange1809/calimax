import { Router } from 'express';
import { AporteController } from '../controllers/aporte.controller.js';
import { verificarJWT, requerirRol } from '../middlewares/auth.middleware.js';

const router = Router();
const aporteController = new AporteController();

// US5: Enviar aportes
router.post('/aportes', verificarJWT, requerirRol('PUBLISHER'), (req, res) => aporteController.crearAporte(req, res));

export default router;
