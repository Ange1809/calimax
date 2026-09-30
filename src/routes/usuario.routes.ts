import { Router } from 'express';
import { register, login } from '../controllers/usuario.controller.js';
import { verificarToken, AuthRequest } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Ruta protegida de prueba
router.get('/perfil', verificarToken, (req: AuthRequest, res) => {
  res.status(200).json({ 
    mensaje: "Acceso autorizado", 
    usuarioDatos: req.usuario 
  });
});

export default router;