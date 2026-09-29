import 'dotenv/config';
import express from 'express';
import tmdbRoutes from './routes/tmdb.routes.js';
import usuarioRoutes from './routes/usuario.routes.js';
import aporteRoutes from './routes/aporte.routes'; // <-- Sin ninguna extensión

const app = express();

app.use(express.json());

app.use('/api/auth', usuarioRoutes);
app.use('/api/metadata', tmdbRoutes);
app.use('/api', aporteRoutes);

export default app;
