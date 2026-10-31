import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Obtener creadores (productores, artistas o usuarios que han subido contenido o se han registrado en los últimos 2 días)
    const users = await prisma.usuarios.findMany({
      where: {
        OR: [
          { tipo: { in: ['productor', 'artista', 'super_admin'] } },
          { beats: { some: {} } },
          { fecha_registro: { gte: twoDaysAgo } },
        ],
      },
      include: {
        beats: {
          where: { estado: 'publico' },
          select: {
            id: true,
            titulo: true,
            tipo: true,
            fecha_subida: true,
          },
          orderBy: { fecha_subida: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            beats: true,
            seguidores: true,
          },
        },
      },
      take: 24,
    });

    const creators = users.map((u) => {
      const regDate = u.fecha_registro ? new Date(u.fecha_registro) : new Date(0);
      const isNew = regDate >= twoDaysAgo;

      const latestBeat = u.beats[0];
      const latestUploadDate = latestBeat?.fecha_subida ? new Date(latestBeat.fecha_subida) : null;
      const hasRecentUpload = latestUploadDate ? latestUploadDate >= twoDaysAgo : false;

      return {
        id: u.id,
        nombre_usuario: u.nombre_usuario,
        tipo: u.tipo,
        foto_perfil: u.foto_perfil,
        banner: u.banner,
        bio: u.bio,
        verificado_google: u.verificado_google,
        fecha_registro: u.fecha_registro,
        beatsCount: u._count.beats,
        followersCount: u._count.seguidores,
        isNew,
        hasRecentUpload,
        latestBeatTitle: latestBeat?.titulo || null,
        latestUploadDate: latestUploadDate?.toISOString() || null,
      };
    });

    // Ordenar de forma dinámica:
    // 1. Usuarios con actividad reciente (subieron contenido en <= 2 días o registrados en <= 2 días)
    // 2. Usuarios con más pistas publicadas
    // 3. Más recientes por fecha de registro
    creators.sort((a, b) => {
      const aRecentScore = (a.hasRecentUpload ? 2 : 0) + (a.isNew ? 1 : 0);
      const bRecentScore = (b.hasRecentUpload ? 2 : 0) + (b.isNew ? 1 : 0);

      if (aRecentScore !== bRecentScore) {
        return bRecentScore - aRecentScore;
      }

      if (b.beatsCount !== a.beatsCount) {
        return b.beatsCount - a.beatsCount;
      }

      const aTime = a.fecha_registro ? new Date(a.fecha_registro).getTime() : 0;
      const bTime = b.fecha_registro ? new Date(b.fecha_registro).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({
      success: true,
      creators: creators.slice(0, 8),
    });
  } catch (error: any) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener creadores' },
      { status: 500 }
    );
  }
}

