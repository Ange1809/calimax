import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import tmdbRoutes from './routes/tmdb.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import aporteRoutes from './routes/aporte.routes.js';
import catalogoRoutes from './routes/catalogo.routes.js';
import moderationRoutes from './routes/moderation.routes.js';
import publisherRoutes from './routes/publisher.routes.js';
import perfilRoutes from './routes/perfil.routes.js';

const app = express();

app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación, por favor intente de nuevo después de 15 minutos.' }
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has alcanzado el límite de reportes permitidos. Intenta nuevamente en 15 minutos.' }
});

app.use(globalLimiter);

const swaggerDocument = YAML.load(path.resolve('swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authLimiter, usuarioRoutes);
app.use('/api/aportes', aporteRoutes);
app.use('/api/moderacion', moderationRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/metadata', tmdbRoutes);
app.use('/api', aporteRoutes);

app.post('/api/catalogo/enlaces/:linkId/reportar', reportLimiter);

app.use('/api/catalogo', catalogoRoutes);

export default app;