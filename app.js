import cluster from 'node:cluster';
import os from 'node:os';
import app from './dist/src/app.js'; // Lee directamente la compilación limpia de la carpeta dist

const PORT = process.env.PORT || 3000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  console.log(`=======================================================`);
  console.log(`[MASTER] Proceso principal corriendo en el PID: ${process.pid}`);
  console.log(`[MASTER] Detectados ${numCPUs} núcleos de CPU disponibles.`);
  console.log(`=======================================================`);

  // R2.1 — Crear un worker por cada CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // R2.1 — Re-forkear automáticamente si un worker muere (resiliencia)
  cluster.on('exit', (worker, code, signal) => {
    console.error(`[MASTER] El Worker con PID ${worker.process.pid} se detuvo de forma inesperada.`);
    console.log('[MASTER] Lanzando un nuevo Worker de reemplazo...');
    cluster.fork();
  });

} else {
  // Cada subproceso levanta la instancia de Express de manera independiente
  app.listen(PORT, () => {
    console.log(`[WORKER ${process.pid}] Servidor Calimax escuchando en http://localhost:${PORT}`);
  });
}
