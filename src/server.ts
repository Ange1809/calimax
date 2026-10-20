// src/server.ts
import cluster from 'node:cluster';
import os from 'node:os';
import app from './app.js'; // 👈 CAMBIO AQUÍ: Apuntamos directamente al archivo app local de desarrollo

const PORT = process.env.PORT || 3000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  console.log(`=======================================================`);
  console.log(`[MASTER] Proceso principal corriendo en el PID: ${process.pid}`);
  console.log(`[MASTER] Detectados ${numCPUs} núcleos de CPU disponibles.`);
  console.log(`=======================================================`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`[MASTER] ¡Alerta! El Worker con PID ${worker.process.pid} se ha detenido.`);
    console.log('[MASTER] Lanzando un nuevo Worker de reemplazo inmediatamente...');
    cluster.fork();
  });

} else {
  app.listen(PORT, () => {
    console.log(`[WORKER ${process.pid}] Servidor Calimax escuchando en http://localhost:${PORT}`);
  });
}
