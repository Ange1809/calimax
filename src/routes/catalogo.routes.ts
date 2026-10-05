import { Router } from 'express';
import { getCatalogo } from '../controllers/catalogo.controller.js';

const router = Router();

router.get('/', getCatalogo);

export default router;