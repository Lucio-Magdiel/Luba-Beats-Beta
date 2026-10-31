import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH: Suspender, reactivar o modificar estado/rol de un usuario
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 });
    }

    const currentUserId = parseInt(session.user.id as string, 10);
    const currentUserRole = (session.user as any).role;

    if (currentUserRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren privilegios de Super Admin.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'ID de usuario no válido.' }, { status: 400 });
    }

    // Prohibir que el super admin se suspenda o degrade a sí mismo
    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { error: 'No puedes suspender ni modificar el estado de tu propia cuenta de Super Admin.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.usuarios.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const body = await req.json();
    const { estado, tipo, strikes, addStrike, removeStrike } = body;

    const dataToUpdate: Record<string, any> = {};

    if (addStrike === true) {
      const nextStrikes = Math.min(3, (targetUser.strikes || 0) + 1);
      dataToUpdate.strikes = nextStrikes;
      if (nextStrikes >= 3) {
        dataToUpdate.estado = 'suspendido';
      }
    } else if (removeStrike === true) {
      const prevStrikes = Math.max(0, (targetUser.strikes || 0) - 1);
      dataToUpdate.strikes = prevStrikes;
      if (prevStrikes < 3 && targetUser.estado === 'suspendido' && estado === undefined) {
        dataToUpdate.estado = 'activo';
      }
    } else if (strikes !== undefined) {
      const cleanStrikes = Math.max(0, Math.min(3, parseInt(strikes, 10) || 0));
      dataToUpdate.strikes = cleanStrikes;
      if (cleanStrikes >= 3) {
        dataToUpdate.estado = 'suspendido';
      }
    }

    if (estado !== undefined) {
      if (!['activo', 'suspendido'].includes(estado)) {
        return NextResponse.json(
          { error: 'Estado no válido. Use "activo" o "suspendido".' },
          { status: 400 }
        );
      }
      dataToUpdate.estado = estado;
    }

    if (tipo !== undefined) {
      const validRoles = ['comprador', 'productor', 'artista', 'super_admin'];
      if (!validRoles.includes(tipo)) {
        return NextResponse.json({ error: 'Rol no válido.' }, { status: 400 });
      }
      dataToUpdate.tipo = tipo;
    }

    const updatedUser = await prisma.usuarios.update({
      where: { id: targetUserId },
      data: dataToUpdate,
      select: {
        id: true,
        nombre_usuario: true,
        correo: true,
        tipo: true,
        estado: true,
        strikes: true,
      },
    });

    return NextResponse.json({
      message: `Usuario ${updatedUser.nombre_usuario} actualizado con éxito.`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar usuario en moderación:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// DELETE: Eliminar permanentemente un usuario de la base de datos
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 });
    }

    const currentUserId = parseInt(session.user.id as string, 10);
    const currentUserRole = (session.user as any).role;

    if (currentUserRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren privilegios de Super Admin.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'ID de usuario no válido.' }, { status: 400 });
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta de Super Admin.' },
        { status: 400 }
      );
    }

    const targetUser = await prisma.usuarios.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'El usuario ya no existe.' }, { status: 404 });
    }

    // Eliminación en cascada en la base de datos
    await prisma.usuarios.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({
      success: true,
      message: `El usuario @${targetUser.nombre_usuario} y todo su contenido fueron eliminados definitivamente.`,
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario.' }, { status: 500 });
  }
}

