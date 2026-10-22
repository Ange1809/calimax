// src/workers/bcrypt.worker.ts
import { parentPort } from 'node:worker_threads';
import bcrypt from 'bcrypt';

// Validamos que el archivo esté corriendo dentro de un hilo secundario
if (!parentPort) {
  throw new Error('Este archivo debe ejecutarse dentro de un Worker Thread');
}

// Escuchamos el evento que nos mande el hilo principal con la contraseña
parentPort.on('message', async (data: { password: string; saltRounds: number }) => {
  try {
    const { password, saltRounds } = data;
    
    // Aquí se ejecuta el algoritmo pesado de encriptación matemática aislado de la API
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Mandamos el resultado limpio de vuelta al servicio principal
    parentPort?.postMessage({ success: true, hash: hashedPassword });
  } catch (error: any) {
    parentPort?.postMessage({ success: false, error: error.message });
  }
});
