import { Router } from 'express';
import { getMetadata } from '../controllers/tmdb.controller.js';

const router = Router();

// Modificamos la ruta para que exija un tipo (pelicula o tv) antes del ID
router.get('/tmdb/:tipo/:id', getMetadata);

export default router;
