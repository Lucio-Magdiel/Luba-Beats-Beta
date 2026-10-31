import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { MessagesClient } from './MessagesClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mensajes Directos | Luba Beats',
  description: 'Comunícate con productores, beatmakers y artistas en Luba Beats.',
};

interface Props {
  searchParams: Promise<{ con?: string }>;
}

export default async function MessagesPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/mensajes');
  }

  const sessionUserId = parseInt(session.user.id as string, 10);
  const { con: preselectedUsername } = await searchParams;

  // Obtener todos los usuarios con los que se puede chatear (excluyéndome a mí)
  const allUsers = await prisma.usuarios.findMany({
    where: {
      id: { not: sessionUserId },
    },
    select: {
      id: true,
      nombre_usuario: true,
      tipo: true,
      foto_perfil: true,
      verificado_google: true,
    },
    orderBy: {
      nombre_usuario: 'asc',
    },
  });

  return (
    <MessagesClient
      currentUser={{
        id: sessionUserId,
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image,
      }}
      availableUsers={allUsers.map((u) => ({
        id: u.id,
        nombre_usuario: u.nombre_usuario,
        tipo: u.tipo,
        foto_perfil: u.foto_perfil,
        verificado_google: !!u.verificado_google,
      }))}
      initialPreselectedUsername={preselectedUsername}
    />
  );
}
