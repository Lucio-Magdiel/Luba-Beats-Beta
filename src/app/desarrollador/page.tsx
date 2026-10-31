import type { Metadata } from 'next';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { DeveloperClient } from './DeveloperClient';
import { DEFAULT_DEVELOPER_PROFILE, type DeveloperProfileData } from '@/app/api/admin/developer/route';

export const metadata: Metadata = {
  title: 'Desarrollador: Magdiel UCHIHA | Luba Beats',
  description:
    'Perfil oficial del desarrollador y arquitecto de software Magdiel UCHIHA (Lucio Magdiel), creador de la plataforma Luba Beats.',
};

export const dynamic = 'force-dynamic';

export default async function DesarrolladorPage() {
  const session = await auth();
  const isSuperAdmin = !!session?.user && (session.user as any).role === 'super_admin';

  let profile: DeveloperProfileData = DEFAULT_DEVELOPER_PROFILE;

  try {
    const record = await prisma.config_sistema.findUnique({
      where: { clave: 'desarrollador_info' },
    });

    if (record?.valor) {
      const parsed = JSON.parse(record.valor);
      profile = { ...DEFAULT_DEVELOPER_PROFILE, ...parsed };
    }
  } catch (err) {
    console.error('Error al cargar perfil de desarrollador desde DB:', err);
  }

  return (
    <DeveloperClient
      initialProfile={profile}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
