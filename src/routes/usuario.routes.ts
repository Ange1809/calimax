import { Router } from 'express';
import {
  login,
  register,
  registerPublisher,
} from '../controllers/usuario.controller.js';

const router = Router();

// Registro y Login utilizando las funciones sueltas de tus compañeros
router.post('/register', register);
router.post('/register/publisher', registerPublisher);
router.post('/login', login);

export default router;
