import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ProducerPanelClient } from './ProducerPanelClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Productor | Luba Beats',
  description: 'Gestiona tu catálogo de instrumentales, precios, visibilidad y estadísticas en Luba Beats.',
};

export default async function ProducerPanelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/productor/panel');
  }

  const userId = parseInt(session.user.id as string, 10);
  let userRole = (session.user as any).role;

  // Si el rol no está en el token, consultar en base de datos
  if (!userRole && !isNaN(userId)) {
    try {
      const dbUser = await prisma.usuarios.findUnique({ where: { id: userId } });
      if (dbUser) userRole = dbUser.tipo;
    } catch (err) {
      console.warn('Error al verificar rol de usuario en MySQL:', err);
    }
  }

  const isSuperAdmin = userRole === 'super_admin';
  const isProducer = userRole === 'productor';

  // Solo productores o super_admin tienen acceso al panel de productor
  if (!isSuperAdmin && !isProducer) {
    redirect('/#catalogo');
  }

  // Obtener beats de este productor exclusivamente (o de todos si es super_admin)
  let formattedBeats: Array<{
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
    const beats = await prisma.beats.findMany({
      where: {
        ...(isSuperAdmin ? {} : { id_productor: userId }),
        estado: { not: 'eliminado' },
      },
      orderBy: {
        id: 'desc',
      },
    });

    formattedBeats = beats.map((b) => ({
      id: b.id,
      titulo: b.titulo,
      tipo: b.tipo,
      genero: b.genero || 'Trap',
      bpm: b.bpm || 140,
      mood: b.mood || 'Energético',
      nota_musical: b.nota_musical || 'C Minor',
      precio: Number(b.precio) || 0,
      estado: b.estado,
      duracion: b.duracion || '03:00',
      archivo_visual: b.archivo_visual || 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/covers/cover_1.jpg',
      archivo_preview: b.archivo_preview || b.archivo_full || '',
      fecha_subida: b.fecha_subida?.toISOString() || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Advertencia: no se pudieron obtener los beats de MySQL:', err);
  }

  return (
    <ProducerPanelClient
      user={{
        id: userId,
        name: session.user.name || 'Productor',
        email: session.user.email || '',
        role: userRole,
        image: session.user.image,
      }}
      initialBeats={formattedBeats}
    />
  );
}
