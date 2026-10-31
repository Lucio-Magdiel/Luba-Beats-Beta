import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET: Obtener lista de IDs de beats favoritos del usuario autenticado
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ favoriteIds: [] });
    }

    const userId = parseInt(session.user.id as string, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ favoriteIds: [] });
    }

    const favs = await prisma.favoritos.findMany({
      where: { id_usuario: userId },
      select: { id_beat: true },
    });

    const favoriteIds = favs.map((f) => String(f.id_beat));

    return NextResponse.json({ favoriteIds });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return NextResponse.json({ favoriteIds: [] });
  }
}

// POST: Alternar (Toggle) favorito para un beat
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para guardar beats en favoritos' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id as string, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Sesión no válida' }, { status: 401 });
    }

    const body = await req.json();
    const { beatId: rawBeatId } = body;
    const beatId = parseInt(String(rawBeatId).replace(/^[^\d]*/, ''), 10);

    if (isNaN(beatId)) {
      return NextResponse.json({ error: 'ID de beat inválido' }, { status: 400 });
    }

    // Verificar si el beat existe en la base de datos
    const beat = await prisma.beats.findUnique({
      where: { id: beatId },
    });

    if (!beat) {
      return NextResponse.json({ error: 'Beat no encontrado' }, { status: 404 });
    }

    // Comprobar si ya está en favoritos
    const existing = await prisma.favoritos.findFirst({
      where: {
        id_usuario: userId,
        id_beat: beatId,
      },
    });

    let isFavorite = false;

    if (existing) {
      // Eliminar de favoritos
      await prisma.favoritos.delete({
        where: { id: existing.id },
      });
      isFavorite = false;
    } else {
      // Agregar a favoritos
      await prisma.favoritos.create({
        data: {
          id_usuario: userId,
          id_beat: beatId,
          fecha_agregado: new Date(),
        },
      });
      isFavorite = true;
    }

    // Obtener total actualizado de favoritos para este beat
    const totalLikes = await prisma.favoritos.count({
      where: { id_beat: beatId },
    });

    return NextResponse.json({
      success: true,
      isFavorite,
      totalLikes,
      message: isFavorite
        ? 'Añadido a tus favoritos'
        : 'Eliminado de tus favoritos',
    });
  } catch (error) {
    console.error('Error al alternar favorito:', error);
    return NextResponse.json(
      { error: 'Error del servidor al actualizar favorito' },
      { status: 500 }
    );
  }
}
