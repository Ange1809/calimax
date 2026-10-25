import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prisma } from '../lib/prisma.js';
import { RegisterPublisherDto, RegisterUsuarioDto } from '../schemas/usuario.schema.js';

const BCRYPT_SALT_ROUNDS = 10;

// Configuración requerida para resolver rutas de archivos usando ES Modules (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('El email ya está registrado');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export interface UsuarioPublico {
  id: string; 
  email: string;
  rol: string;
}

// =========================================================================
// FUNCIÓN AUXILIAR ENVOLVEDORA DEL WORKER THREAD (R2.2)
// =========================================================================
function hashPasswordWithWorker(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Apuntamos de forma dinámica al archivo del worker thread según el entorno
    const isDevelopment = process.env.NODE_ENV === 'development' || !__dirname.includes('dist');
    
    // Si estamos en desarrollo leemos el .ts con ts-node, en producción el compilado .js
    const workerPath = isDevelopment 
      ? path.resolve(__dirname, '../workers/bcrypt.worker.ts')
      : path.resolve(__dirname, '../workers/bcrypt.worker.js');

    const worker = new Worker(workerPath, {
      execArgv: isDevelopment ? ['-r', 'ts-node/register'] : []
    });

    // Enviamos la información al hilo secundario
    worker.postMessage({ password, saltRounds: BCRYPT_SALT_ROUNDS });

    // Escuchamos la respuesta final
    worker.on('message', (response) => {
      if (response.success) {
        resolve(response.hash);
      } else {
        reject(new Error(response.error));
      }
      worker.terminate(); // Destruimos el hilo de forma segura
    });

    worker.on('error', (err) => {
      reject(err);
      worker.terminate();
    });
  });
}

export class UsuarioService {
  async registrar(input: RegisterUsuarioDto): Promise<UsuarioPublico> {
    return this.crearUsuario(input, 'USER');
  }

  async registrarPublisher(input: RegisterPublisherDto): Promise<UsuarioPublico> {
    const existente = await prisma.usuario.findUnique({
      where: { email: input.email },
    });

    if (existente !== null) {
      throw new EmailAlreadyRegisteredError();
    }

    const password_hash = await hashPasswordWithWorker(input.password);
    const usuario = await prisma.usuario.create({
      data: {
        email: input.email,
        password_hash,
        rol: 'PUBLISHER',
        nombrePublico: input.nombrePublico,
        publisherTermsAcceptedAt: new Date(),
        publisherLinks: {
          create: [
            ...input.enlacesSociales.map((link) => ({
              categoria: 'SOCIAL' as const,
              plataforma: link.plataforma,
              url: link.url,
            })),
            ...input.enlacesAlojamiento.map((link) => ({
              categoria: 'ALOJAMIENTO' as const,
              plataforma: link.plataforma,
              url: link.url,
            })),
          ],
        },
      },
      select: {
        id: true,
        email: true,
        rol: true,
      },
    });

    return {
      id: String(usuario.id),
      email: usuario.email,
      rol: String(usuario.rol),
    };
  }

  private async crearUsuario(input: RegisterUsuarioDto, rol: 'USER'): Promise<UsuarioPublico> {
    const existente = await prisma.usuario.findUnique({
      where: { email: input.email },
    });

    if (existente !== null) {
      throw new EmailAlreadyRegisteredError();
    }

    // 👈 CAMBIO CRÍTICO: Ahora el hash matemático corre en un hilo secundario independiente (R2.2)
    const password_hash = await hashPasswordWithWorker(input.password);

    const usuario = await prisma.usuario.create({
      data: {
        email: input.email,
        password_hash,
        rol,
      },
      select: {
        id: true,
        email: true,
        rol: true,
      },
    });

    return {
      id: String(usuario.id),
      email: usuario.email,
      rol: String(usuario.rol)
    };
  }

  async login(input: RegisterUsuarioDto) {
    const usuario = await prisma.usuario.findUnique({
      where: { email: input.email }
    });

    if (!usuario) {
      throw new Error('CREDENCIALES_INVALIDAS');
    }

    const passwordValida = await bcrypt.compare(input.password, usuario.password_hash);
    if (!passwordValida) {
      throw new Error('CREDENCIALES_INVALIDAS');
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    return {
      token,
      usuario: { id: String(usuario.id), email: usuario.email, rol: usuario.rol }
    };
  }
}
