import express from 'express';
import tmdbRoutes from './routes/tmdb.routes.js';

const app = express();

app.use(express.json());

// Montamos la ruta en el prefijo /api/metadata
app.use('/api/metadata', tmdbRoutes);

export default app;
