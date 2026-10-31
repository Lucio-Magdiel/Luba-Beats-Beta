import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleSeed(req);
}

export async function POST(req: NextRequest) {
  return handleSeed(req);
}

async function handleSeed(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get('secret') || req.headers.get('x-seed-secret');
    if (secret !== 'luba_chjn_super_admin_2026') {
      return NextResponse.json({ error: 'Acceso no autorizado.' }, { status: 403 });
    }

    const email = 'luismiguelancallasivana@gmail.com';
    const username = 'CHJN';
    const rawPassword = req.nextUrl.searchParams.get('pwd') || 'ChjnAdmin2026!';

    // Hashear con bcrypt costo 12
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Buscar si ya existe por correo o nombre de usuario
    const existing = await prisma.usuarios.findFirst({
      where: {
        OR: [
          { correo: email },
          { nombre_usuario: username }
        ]
      }
    });

    let resultUser;
    if (existing) {
      resultUser = await prisma.usuarios.update({
        where: { id: existing.id },
        data: {
          nombre_usuario: username,
          correo: email,
          contrasena: hashedPassword,
          tipo: 'super_admin',
          estado: 'activo',
          strikes: 0,
          verificado_google: true,
          bio: 'Co-Administrador & Supervisor Maestro de Luba Beats',
        }
      });
    } else {
      resultUser = await prisma.usuarios.create({
        data: {
          nombre_usuario: username,
          correo: email,
          contrasena: hashedPassword,
          tipo: 'super_admin',
          estado: 'activo',
          strikes: 0,
          verificado_google: true,
          bio: 'Co-Administrador & Supervisor Maestro de Luba Beats',
          foto_perfil: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario Super Admin configurado y activado exitosamente.',
      user: {
        id: resultUser.id,
        nombre_usuario: resultUser.nombre_usuario,
        correo: resultUser.correo,
        tipo: resultUser.tipo,
        estado: resultUser.estado,
        contrasena_asignada: rawPassword,
      }
    });
  } catch (error: any) {
    console.error('Error al sembrar usuario admin:', error);
    return NextResponse.json(
      { error: 'Error al procesar creación de super admin', details: error?.message },
      { status: 500 }
    );
  }
}
