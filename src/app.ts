import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import tmdbRoutes from './routes/tmdb.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import aporteRoutes from './routes/aporte.routes.js'; // Busca directo en la carpeta routes

const app = express();

app.use(express.json());

// Configuración de Swagger
const swaggerDocument = YAML.load(path.resolve('swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', usuarioRoutes);
app.use('/api/metadata', tmdbRoutes);
app.use('/api', aporteRoutes);

export default app;
