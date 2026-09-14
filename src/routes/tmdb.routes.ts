import { Router } from 'express';
import { getMetadata } from '../controllers/tmdb.controller.js';

const router = Router();

router.get('/tmdb/:id', getMetadata);

export default router;
