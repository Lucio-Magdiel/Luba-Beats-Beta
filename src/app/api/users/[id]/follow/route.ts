import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Obtener estado de seguimiento y conteos
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'ID de usuario no válido' }, { status: 400 });
    }

    const session = await auth();
    let isFollowing = false;

    if (session?.user) {
      const sessionUserId = parseInt(session.user.id as string, 10);
      const followRecord = await prisma.seguidores.findUnique({
        where: {
          id_seguidor_id_seguido: {
            id_seguidor: sessionUserId,
            id_seguido: targetUserId,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.seguidores.count({
        where: { id_seguido: targetUserId },
      }),
      prisma.seguidores.count({
        where: { id_seguidor: targetUserId },
      }),
    ]);

    return NextResponse.json({
      isFollowing,
      followersCount,
      followingCount,
    });
  } catch (error) {
    console.error('Error al obtener seguimiento:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST: Alternar seguir / dejar de seguir (Toggle follow)
export async function POST(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para seguir a este usuario' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'ID de usuario no válido' }, { status: 400 });
    }

    const sessionUserId = parseInt(session.user.id as string, 10);

    if (sessionUserId === targetUserId) {
      return NextResponse.json(
        { error: 'No puedes seguirte a ti mismo' },
        { status: 400 }
      );
    }

    // Verificar si ya lo sigue
    const existingFollow = await prisma.seguidores.findUnique({
      where: {
        id_seguidor_id_seguido: {
          id_seguidor: sessionUserId,
          id_seguido: targetUserId,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      // Dejar de seguir
      await prisma.seguidores.delete({
        where: { id: existingFollow.id },
      });
      isFollowing = false;
    } else {
      // Seguir
      await prisma.seguidores.create({
        data: {
          id_seguidor: sessionUserId,
          id_seguido: targetUserId,
        },
      });
      isFollowing = true;
    }

    // Recalcular total de seguidores
    const followersCount = await prisma.seguidores.count({
      where: { id_seguido: targetUserId },
    });

    return NextResponse.json({
      isFollowing,
      followersCount,
      message: isFollowing ? 'Ahora sigues a este usuario' : 'Has dejado de seguir a este usuario',
    });
  } catch (error) {
    console.error('Error al alternar seguimiento:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
