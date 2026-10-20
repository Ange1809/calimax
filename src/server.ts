import cluster from 'cluster';
import os from 'os';
import app from './app.js';

const PORT = process.env.PORT || 3000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master process ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers for maximum concurrency...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting a new one...`);
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Worker ${process.pid} started and listening on port ${PORT}`);
  });
}
