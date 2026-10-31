import { notFound } from 'next/navigation';
import { getBeatBySlugOrId } from '@/lib/getBeat';
import { BeatDetailClient } from './BeatDetailClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const beat = await getBeatBySlugOrId(slug);

  if (!beat) {
    return {
      title: 'Pista no encontrada | Luba Beats',
    };
  }

  const categoryName = beat.type === 'beat' ? 'Beat Instrumental' : 'Música / Canción';
  return {
    title: `${beat.title} - ${categoryName} de ${beat.producer.name} | Luba Beats`,
    description: `Escucha y adquiere la licencia oficial de ${beat.title} por ${beat.producer.name}. Tempo: ${beat.bpm} BPM, Tonalidad: ${beat.key}, Género: ${beat.genre}. Descarga inmediata y streaming en Luba Beats.`,
    openGraph: {
      title: `${beat.title} - ${beat.producer.name} | Luba Beats`,
      description: `${categoryName} (${beat.bpm} BPM - ${beat.key}). Disponible para comprar o escuchar en streaming.`,
      images: [{ url: beat.coverUrl }],
    },
  };
}

export default async function BeatPage({ params }: Props) {
  const { slug } = await params;
  const beat = await getBeatBySlugOrId(slug);

  if (!beat) {
    notFound();
  }

  return <BeatDetailClient beat={beat} />;
}
