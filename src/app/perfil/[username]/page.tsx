import { notFound } from 'next/navigation';
import { getUserProfile } from '@/lib/getProfile';
import { ProfileClient } from './ProfileClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getUserProfile(username);

  if (!profile) {
    return {
      title: 'Perfil no encontrado | Luba Beats',
    };
  }

  const roleLabel =
    profile.tipo === 'productor'
      ? 'Productor de Beats'
      : profile.tipo === 'artista'
      ? 'Artista Musical'
      : 'Perfil de Usuario';

  return {
    title: `${profile.nombre_usuario} (${roleLabel}) | Luba Beats`,
    description: `Descubre y escucha el catálogo musical oficial de ${profile.nombre_usuario} en Luba Beats. ${profile.beats.length} pistas disponibles para compra de licencias y streaming.`,
    openGraph: {
      title: `${profile.nombre_usuario} en Luba Beats`,
      description: `Catálogo musical de ${profile.nombre_usuario}. ${profile.beats.length} canciones e instrumentales en alta definición.`,
      images: profile.foto_perfil ? [{ url: profile.foto_perfil }] : [],
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getUserProfile(username);

  if (!profile) {
    notFound();
  }

  return <ProfileClient profile={profile} />;
}
