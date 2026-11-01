import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Beat, ItemType, MusicalKey, MusicGenre, MusicMood } from '@/types/beat';

export const dynamic = 'force-dynamic';

// Utility to generate aesthetic waveform array
const generateWaveform = (seed: number, count = 55): number[] => {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const val = Math.abs(Math.sin(i * 0.22 + seed) * 0.65 + Math.cos(i * 0.4 + seed * 2) * 0.35);
    result.push(Math.max(0.15, Math.min(1.0, Number(val.toFixed(2)))));
  }
  return result;
};

const defaultLicenses = (basePrice: number) => [
  {
    tier: 'basic' as const,
    name: 'Licencia Básica (MP3)',
    price: basePrice,
    pricePEN: Math.round(basePrice * 3.75),
    format: 'MP3 Estéreo (320kbps)',
    streamsLimit: 'Hasta 100,000 reproducciones',
    musicVideoLimit: '1 video musical no monetizado',
    radioBroadcasting: false,
    forProfitPerformances: false,
    description: 'Perfecto para artistas emergentes, demos, singles en Spotify y YouTube sin monetización comercial a gran escala.'
  },
  {
    tier: 'premium' as const,
    name: 'Licencia Premium (WAV + Stems)',
    price: Math.round(basePrice * 2.8),
    pricePEN: Math.round(basePrice * 2.8 * 3.75),
    format: 'WAV 24-bit + Pistas Separadas (Stems)',
    streamsLimit: 'Hasta 500,000 reproducciones',
    musicVideoLimit: 'Videos monetizados ilimitados',
    radioBroadcasting: true,
    forProfitPerformances: true,
    description: 'Para artistas que van a lanzar en todas las tiendas digitales, mezclar la voz con las pistas separadas y distribución comercial.'
  },
  {
    tier: 'exclusive' as const,
    name: 'Licencia Exclusiva (Derechos Totales)',
    price: Math.round(basePrice * 12),
    pricePEN: Math.round(basePrice * 12 * 3.75),
    format: 'WAV Master 24-bit + Stems + Contrato de Cesión',
    streamsLimit: 'Reproducciones ILIMITADAS',
    musicVideoLimit: 'ILIMITADO en TV, Cine y Streaming',
    radioBroadcasting: true,
    forProfitPerformances: true,
    description: 'El beat se retira de la venta inmediatamente. Eres el único dueño y puedes registrarlo al 100% en sociedades de gestión.'
  }
];

export async function GET() {
  try {
    // Asegurar que la columna reproducciones existe
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE beats ADD COLUMN IF NOT EXISTS reproducciones INT DEFAULT 0;`
      );
    } catch (_) {}

    const dbBeats = await prisma.beats.findMany({
      where: {
        estado: 'publico',
        usuarios: {
          estado: { not: 'suspendido' },
        },
      },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre_usuario: true,
            tipo: true,
            foto_perfil: true,
            verificado_google: true
          }
        },
        _count: {
          select: {
            favoritos: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    const beats: Beat[] = dbBeats.map((b) => {
      const priceNum = Number(b.precio) || 0;
      const isFree = b.tipo === 'musica' || priceNum === 0;

      // Parse duration
      let durationSeconds = 180;
      if (b.duracion && b.duracion.includes(':')) {
        const [mins, secs] = b.duracion.split(':').map(Number);
        if (!isNaN(mins) && !isNaN(secs)) {
          durationSeconds = mins * 60 + secs;
        }
      }

      return {
        id: String(b.id),
        title: b.titulo,
        slug: b.titulo
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-') + `-${b.id}`,
        type: b.tipo as ItemType,
        producer: {
          id: String(b.usuarios.id),
          name: b.usuarios.nombre_usuario,
          handle: b.usuarios.nombre_usuario,
          avatar:
            b.usuarios.foto_perfil ||
            'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/profiles/profile_2.png',
          verified: Boolean(b.usuarios.verificado_google || b.usuarios.tipo === 'super_admin' || b.usuarios.nombre_usuario === 'chojin'),
          country: 'Perú',
          totalBeats: 42,
          role: b.usuarios.tipo === 'artista' ? 'artista' : 'productor'
        },
        genre: (b.genero?.split('/')[0]?.trim() || 'Trap') as MusicGenre,
        bpm: b.bpm || 140,
        key: (b.nota_musical || 'C Minor') as MusicalKey,
        mood: (b.mood?.split('/')[0]?.trim() || 'Energético') as MusicMood,
        tags: [b.genero || 'Trap', `${b.bpm || 140} BPM`, b.tipo],
        duration: durationSeconds,
        durationFormatted: b.duracion || '3:00',
        audioPreviewUrl: b.archivo_preview || '',
        coverUrl:
          b.archivo_visual ||
          'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544169/chojin/visuales/beat_visual_1_1761544169.jpg',
        waveform: generateWaveform(b.id * 1.7),
        priceFrom: priceNum,
        priceFromPEN: Math.round(priceNum * 3.75),
        plays: Number((b as any).reproducciones ?? 0),
        likes: b._count?.favoritos ?? 0,
        isFeatured: b.id % 2 === 0,
        isFree,
        createdAt: b.fecha_subida?.toISOString() || new Date().toISOString(),
        licenses: isFree ? [] : defaultLicenses(priceNum)
      };
    });

    return NextResponse.json({
      success: true,
      total: beats.length,
      beats
    });
  } catch (error: unknown) {
    console.error('Error fetching beats from DB:', error);
    return NextResponse.json(
      { error: 'Error del servidor al consultar el catálogo' },
      { status: 500 }
    );
  }
}
