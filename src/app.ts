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

const app = express();

// Hardening 1: CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Hardening 2: Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos desde esta IP, por favor intente de nuevo después de 15 minutos.'
});

// Configuración de Swagger
const swaggerDocument = YAML.load(path.resolve('swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Aplicar rate limiting solo a las rutas de auth
app.use('/api/auth', authLimiter, usuarioRoutes);
app.use('/api/aportes', aporteRoutes);
app.use('/api/metadata', tmdbRoutes);

export default app;
