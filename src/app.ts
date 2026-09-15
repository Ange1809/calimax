import express from 'express';
import tmdbRoutes from './routes/tmdb.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';

const app = express();

app.use(express.json());

app.use('/api/auth', usuarioRoutes);
app.use('/api/metadata', tmdbRoutes);

export default app;
