import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AdminPanelClient } from './AdminPanelClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel de Administración Global | Luba Beats',
  description: 'Control maestro de usuarios, catálogo y métricas de la plataforma Luba Beats.',
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  const userId = parseInt(session.user.id as string, 10);
  let userRole = (session.user as any).role;

  if (!userRole && !isNaN(userId)) {
    try {
      const dbUser = await prisma.usuarios.findUnique({ where: { id: userId } });
      if (dbUser) userRole = dbUser.tipo;
    } catch (err) {
      console.warn('Error al verificar rol de admin en MySQL:', err);
    }
  }

  // Solo super_admin puede acceder al panel maestro
  if (userRole !== 'super_admin') {
    redirect('/');
  }

  // Obtener estadísticas globales y listas
  const [totalUsers, users, beats] = await Promise.all([
    prisma.usuarios.count(),
    prisma.usuarios.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        nombre_usuario: true,
        correo: true,
        tipo: true,
        foto_perfil: true,
        verificado_google: true,
        fecha_registro: true,
      },
    }),
    prisma.beats.findMany({
      orderBy: { id: 'desc' },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre_usuario: true,
            tipo: true,
          },
        },
      },
    }),
  ]);

  const formattedUsers = users.map((u) => ({
    id: u.id,
    nombre_usuario: u.nombre_usuario,
    correo: u.correo,
    tipo: u.tipo,
    foto_perfil: u.foto_perfil,
    verificado_google: !!u.verificado_google,
    fecha_registro: u.fecha_registro?.toISOString() || new Date().toISOString(),
  }));

  const formattedBeats = beats.map((b) => ({
    id: b.id,
    titulo: b.titulo,
    tipo: b.tipo,
    genero: b.genero || 'Trap',
    bpm: b.bpm || 140,
    precio: Number(b.precio) || 0,
    estado: b.estado,
    duracion: b.duracion || '03:00',
    archivo_visual: b.archivo_visual || 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/covers/cover_1.jpg',
    archivo_preview: b.archivo_preview || b.archivo_full || '',
    fecha_subida: b.fecha_subida?.toISOString() || new Date().toISOString(),
    productor: {
      id: b.usuarios.id,
      nombre_usuario: b.usuarios.nombre_usuario,
      tipo: b.usuarios.tipo,
    },
  }));

  return (
    <AdminPanelClient
      adminUser={{
        id: parseInt(session.user.id as string, 10),
        name: session.user.name || 'Super Admin',
        email: session.user.email || '',
      }}
      totalUsers={totalUsers}
      users={formattedUsers}
      beats={formattedBeats}
    />
  );
}
