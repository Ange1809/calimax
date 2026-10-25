import { Router } from 'express';
import { ModerationController } from '../controllers/moderation.controller.js';
import { requerirRol, verificarJWT } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new ModerationController();

router.get('/pendientes', verificarJWT, requerirRol('MODERATOR', 'ADMIN'), (req, res) =>
  controller.listarPendientes(req, res));
router.patch('/:id/estado', verificarJWT, requerirRol('MODERATOR', 'ADMIN'), (req, res) =>
  controller.resolver(req, res));

export default router;
