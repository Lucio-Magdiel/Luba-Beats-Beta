import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ComprasClient } from './ComprasClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mis Compras y Licencias | Luba Beats',
  description: 'Accede a tus beats adquiridos, descargas de audio master y contratos legales de licencia en Luba Beats.',
};

export default async function ComprasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/compras');
  }

  const userId = parseInt(session.user.id as string, 10);

  // Consultar compras del usuario en la base de datos MySQL
  const purchasesRecords = await prisma.compras.findMany({
    where: { id_comprador: userId },
    include: {
      beat: {
        select: {
          id: true,
          titulo: true,
          archivo_preview: true,
          archivo_full: true,
          archivo_visual: true,
          usuarios: {
            select: {
              id: true,
              nombre_usuario: true,
            },
          },
        },
      },
    },
    orderBy: { id: 'desc' },
  });

  const formattedPurchases = purchasesRecords.map((c) => ({
    id: c.id,
    precio: Number(c.precio),
    moneda: c.moneda,
    licencia: c.licencia,
    metodo_pago: c.metodo_pago,
    referencia_pago: c.referencia_pago || `LB-${c.id}`,
    estado: c.estado,
    fecha_compra: c.fecha_compra?.toISOString() || new Date().toISOString(),
    beat_id: c.beat.id,
    beat_titulo: c.beat.titulo,
    archivo_preview: c.beat.archivo_preview || '',
    archivo_full: c.beat.archivo_full || c.beat.archivo_preview || '',
    beat_cover: c.beat.archivo_visual || 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544169/chojin/visuales/beat_visual_1_1761544169.jpg',
    productor_nombre: c.beat.usuarios.nombre_usuario,
  }));

  return (
    <ComprasClient
      user={{
        id: userId,
        name: session.user.name || 'Comprador',
        email: session.user.email || '',
      }}
      purchases={formattedPurchases}
    />
  );
}
