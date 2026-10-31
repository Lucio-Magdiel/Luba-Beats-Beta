import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ArtistPanelClient } from './ArtistPanelClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Artista | Luba Beats',
  description: 'Gestiona tus canciones, demos, lanzamientos y catálogo musical en Luba Beats.',
};

export default async function ArtistPanelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/artista/panel');
  }

  const userId = parseInt(session.user.id as string, 10);
  let userRole = (session.user as any).role;

  if (!userRole && !isNaN(userId)) {
    try {
      const dbUser = await prisma.usuarios.findUnique({ where: { id: userId } });
      if (dbUser) userRole = dbUser.tipo;
    } catch (err) {
      console.warn('Error al verificar rol de artista en MySQL:', err);
    }
  }

  const isSuperAdmin = userRole === 'super_admin';
  const isArtista = userRole === 'artista';

  if (!isSuperAdmin && !isArtista) {
    redirect('/#catalogo');
  }

  let formattedTracks: Array<{
    id: number;
    titulo: string;
    tipo: string;
    genero: string;
    bpm: number;
    mood: string;
    nota_musical: string;
    precio: number;
    estado: string;
    duracion: string;
    archivo_visual: string;
    archivo_preview: string;
    fecha_subida: string;
  }> = [];

  try {
    const tracks = await prisma.beats.findMany({
      where: {
        ...(isSuperAdmin ? {} : { id_productor: userId }),
        tipo: 'musica',
        estado: { not: 'eliminado' },
      },
      orderBy: {
        id: 'desc',
      },
    });

    formattedTracks = tracks.map((b) => ({
      id: b.id,
      titulo: b.titulo,
      tipo: b.tipo || 'musica',
      genero: b.genero || 'Urbano',
      bpm: b.bpm || 120,
      mood: b.mood || 'Inspirador',
      nota_musical: b.nota_musical || 'C Minor',
      precio: Number(b.precio) || 0,
      duracion: b.duracion || '03:15',
      estado: b.estado,
      archivo_visual: b.archivo_visual || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      archivo_preview: b.archivo_preview || b.archivo_full || '',
      fecha_subida: b.fecha_subida?.toISOString() || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Advertencia: no se pudieron obtener las canciones de MySQL:', err);
  }

  return (
    <ArtistPanelClient
      user={{
        id: userId,
        name: session.user.name || 'Artista',
        email: session.user.email || '',
        role: userRole,
        image: session.user.image,
      }}
      initialTracks={formattedTracks}
    />
  );
}
