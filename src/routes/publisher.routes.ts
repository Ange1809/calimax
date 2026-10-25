import { Router } from 'express';
import { PublisherController } from '../controllers/publisher.controller.js';

const router = Router();
const controller = new PublisherController();

router.get('/cartelera', (req, res) => controller.cartelera(req, res));
router.get('/:id', (req, res) => controller.perfilPublico(req, res));

export default router;
