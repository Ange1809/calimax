import { Router } from 'express';
import { PerfilController } from '../controllers/perfil.controller.js';
import { verificarJWT } from '../middlewares/auth.middleware.js';

const router = Router();
const controller = new PerfilController();

router.use(verificarJWT);
router.get('/', (req, res) => controller.obtener(req, res));
router.patch('/', (req, res) => controller.actualizar(req, res));

export default router;
