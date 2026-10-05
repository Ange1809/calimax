import { Router } from 'express';
import { AporteController } from '../controllers/aporte.controller.js';
import { verificarJWT, requerirRol } from '../middlewares/auth.middleware.js'; // Los guardianes de Emmanuel y Oriana

const router = Router();
const aporteController = new AporteController();

// US5: Proteger el envío de aportes para cualquier usuario que haya iniciado sesión
router.post('/aportes', verificarJWT, (req, res) => aporteController.enviarAporte(req, res));

// US6: Proteger el panel de moderación únicamente para usuarios con el rol MODERATOR
router.get('/moderacion/pendientes', verificarJWT, requerirRol('MODERATOR'), (req, res) => aporteController.listarPendientes(req, res));
router.patch('/moderacion/:id/estado', verificarJWT, requerirRol('MODERATOR'), (req, res) => aporteController.cambiarEstado(req, res));
﻿import { Router } from 'express';
import { eliminarAporte } from '../controllers/aporte.controller.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint protegido (Requiere Auth + IDOR check dentro del controlador)
router.delete('/:id', verificarToken, eliminarAporte);

export default router;
