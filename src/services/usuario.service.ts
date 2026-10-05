import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../lib/prisma.js';
import { RegisterUsuarioDto } from '../schemas/usuario.schema.js';

const BCRYPT_SALT_ROUNDS = 10;

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('El email ya está registrado');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export interface UsuarioPublico {
  id: string; // <-- Cambiado a string para unificarlo con tu base de datos UUID
  email: string;
  rol: string;
}

export class UsuarioService {
  async registrar(input: RegisterUsuarioDto): Promise<UsuarioPublico> {
    const existente = await prisma.usuario.findUnique({
      where: { email: input.email },
    });

    if (existente !== null) {
      throw new EmailAlreadyRegisteredError();
    }

    const password_hash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const usuario = await prisma.usuario.create({
      data: {
        email: input.email,
        password_hash,
      },
      select: {
        id: true,
        email: true,
        rol: true,
      },
    });

    // Mapeo seguro garantizando que el ID se devuelva como string
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
      throw new Error("CREDENCIALES_INVALIDAS");
    }

    const passwordValida = await bcrypt.compare(input.password, usuario.password_hash);
    if (!passwordValida) {
      throw new Error("CREDENCIALES_INVALIDAS");
    }

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
