import { Router } from 'express';
import { register, login } from '../controllers/usuario.controller.js';
import { verificarJWT, requerirRol } from '../middlewares/auth.middleware.js';

const router = Router();

// Registro y Login utilizando las funciones sueltas de tus compañeros
router.post('/register', register);
router.post('/login', login);

export default router;
