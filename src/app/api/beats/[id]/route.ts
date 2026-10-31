import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { beats_estado } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Obtener detalles de un beat por ID
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const beatId = parseInt(id, 10);

    if (isNaN(beatId)) {
      return NextResponse.json({ error: 'ID de beat no válido' }, { status: 400 });
    }

    const beat = await prisma.beats.findUnique({
      where: { id: beatId },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre_usuario: true,
            tipo: true,
            foto_perfil: true,
          },
        },
      },
    });

    if (!beat) {
      return NextResponse.json({ error: 'Beat no encontrado' }, { status: 404 });
    }

    const session = await auth();
    const sessionUserId = session?.user?.id ? parseInt(session.user.id as string, 10) : null;
    const sessionUserRole = (session?.user as any)?.role;
    const isOwnerOrAdmin = sessionUserId !== null && (beat.id_productor === sessionUserId || sessionUserRole === 'super_admin');

    // Sanitizar respuesta para no exponer el audio master sin comprar
    const sanitizedBeat = {
      ...beat,
      archivo_full: isOwnerOrAdmin ? beat.archivo_full : undefined,
    };

    return NextResponse.json({ beat: sanitizedBeat });
  } catch (error) {
    console.error('Error al obtener beat:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PATCH: Actualizar metadatos o estado de un beat
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 });
    }

    const { id } = await params;
    const beatId = parseInt(id, 10);

    if (isNaN(beatId)) {
      return NextResponse.json({ error: 'ID de beat no válido' }, { status: 400 });
    }

    const existingBeat = await prisma.beats.findUnique({
      where: { id: beatId },
    });

    if (!existingBeat) {
      return NextResponse.json({ error: 'Beat no encontrado' }, { status: 404 });
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    const sessionUserRole = (session.user as any).role;

    // Verificar propiedad o rol super_admin
    const isOwner = existingBeat.id_productor === sessionUserId;
    const isAdmin = sessionUserRole === 'super_admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar este beat' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { titulo, precio, estado, bpm, genero, nota_musical, mood } = body;

    const updateData: Record<string, any> = {};

    if (titulo !== undefined) updateData.titulo = String(titulo).trim();
    if (sessionUserRole === 'artista' || existingBeat.tipo === 'musica') {
      updateData.precio = 0;
    } else if (precio !== undefined) {
      updateData.precio = parseFloat(precio) || 0;
    }
    if (bpm !== undefined) updateData.bpm = parseInt(bpm, 10) || null;
    if (genero !== undefined) updateData.genero = String(genero).trim();
    if (nota_musical !== undefined) updateData.nota_musical = String(nota_musical).trim();
    if (mood !== undefined) updateData.mood = String(mood).trim();

    if (estado !== undefined) {
      const validEstados: beats_estado[] = ['publico', 'privado', 'oculto', 'eliminado'];
      if (validEstados.includes(estado)) {
        updateData.estado = estado;
      }
    }

    const updated = await prisma.beats.update({
      where: { id: beatId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Pista actualizada correctamente',
      beat: updated,
    });
  } catch (error) {
    console.error('Error al actualizar beat:', error);
    return NextResponse.json({ error: 'Error al actualizar beat' }, { status: 500 });
  }
}

// DELETE: Eliminar un beat de la plataforma
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 });
    }

    const { id } = await params;
    const beatId = parseInt(id, 10);

    if (isNaN(beatId)) {
      return NextResponse.json({ error: 'ID de beat no válido' }, { status: 400 });
    }

    const existingBeat = await prisma.beats.findUnique({
      where: { id: beatId },
    });

    if (!existingBeat) {
      return NextResponse.json({ error: 'Beat no encontrado' }, { status: 404 });
    }

    const sessionUserId = parseInt(session.user.id as string, 10);
    const sessionUserRole = (session.user as any).role;

    const isOwner = existingBeat.id_productor === sessionUserId;
    const isAdmin = sessionUserRole === 'super_admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este beat' },
        { status: 403 }
      );
    }

    // Eliminación en base de datos (con cascada en playlist_beats y favoritos configurada en MySQL)
    await prisma.beats.delete({
      where: { id: beatId },
    });

    return NextResponse.json({
      success: true,
      message: 'Pista eliminada exitosamente del catálogo',
    });
  } catch (error) {
    console.error('Error al eliminar beat:', error);
    return NextResponse.json({ error: 'Error al eliminar el beat' }, { status: 500 });
  }
}
