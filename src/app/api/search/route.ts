import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Beat, ItemType, MusicalKey, MusicGenre, MusicMood } from '@/types/beat';
import { MOCK_BEATS } from '@/data/mockBeats';

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
    description: 'Perfecto para artistas emergentes y singles en Spotify.'
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
    description: 'Para artistas que van a lanzar en todas las plataformas con stems.'
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
    description: 'El beat se retira de la venta inmediatamente. Eres el único dueño.'
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        beats: [],
        users: []
      });
    }

    const qLower = query.toLowerCase();

    // 1. Buscar beats en MySQL
    const dbBeats = await prisma.beats.findMany({
      where: {
        estado: 'publico',
        OR: [
          { titulo: { contains: query } },
          { genero: { contains: query } },
          { mood: { contains: query } },
          { usuarios: { nombre_usuario: { contains: query } } }
        ]
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
        }
      },
      take: 6,
      orderBy: { id: 'desc' }
    });

    const formattedDbBeats: Beat[] = dbBeats.map((b) => {
      const priceNum = Number(b.precio) || 0;
      const isFree = b.tipo === 'musica' || priceNum === 0;

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
        slug: b.titulo.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') + `-${b.id}`,
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
        plays: 1200 + b.id * 350,
        likes: 150 + b.id * 45,
        isFeatured: false,
        isFree,
        createdAt: b.fecha_subida?.toISOString() || new Date().toISOString(),
        licenses: isFree ? [] : defaultLicenses(priceNum)
      };
    });

    // Complementar con mock beats si no existen o hay pocos resultados
    const mockMatches = MOCK_BEATS.filter(
      (b) =>
        b.title.toLowerCase().includes(qLower) ||
        b.producer.name.toLowerCase().includes(qLower) ||
        b.producer.handle.toLowerCase().includes(qLower) ||
        b.genre.toLowerCase().includes(qLower)
    );

    const existingBeatIds = new Set(formattedDbBeats.map((b) => b.id));
    const combinedBeats = [...formattedDbBeats];
    for (const mb of mockMatches) {
      if (!existingBeatIds.has(mb.id)) {
        combinedBeats.push(mb);
        existingBeatIds.add(mb.id);
      }
      if (combinedBeats.length >= 6) break;
    }

    // 2. Buscar usuarios en MySQL
    const dbUsers = await prisma.usuarios.findMany({
      where: {
        OR: [
          { nombre_usuario: { contains: query } },
          { bio: { contains: query } }
        ]
      },
      select: {
        id: true,
        nombre_usuario: true,
        tipo: true,
        foto_perfil: true,
        verificado_google: true,
        bio: true,
        _count: {
          select: {
            beats: true,
            seguidores: true
          }
        }
      },
      take: 6,
      orderBy: { id: 'desc' }
    });

    const formattedUsers = dbUsers.map((u) => ({
      id: u.id,
      nombre_usuario: u.nombre_usuario,
      tipo: u.tipo,
      foto_perfil:
        u.foto_perfil ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      verificado: Boolean(u.verificado_google || u.tipo === 'super_admin' || u.nombre_usuario === 'chojin'),
      bio: u.bio || '',
      beatsCount: u._count.beats,
      followersCount: u._count.seguidores
    }));

    // Si busca "chojin" y no está en la BD, agregarlo como perfil conocido
    if ('chojin'.includes(qLower) && !formattedUsers.some((u) => u.nombre_usuario.toLowerCase() === 'chojin')) {
      formattedUsers.unshift({
        id: 2,
        nombre_usuario: 'chojin',
        tipo: 'productor',
        foto_perfil: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/profiles/profile_2.png',
        verificado: true,
        bio: 'Beatmaker & Productor musical profesional en Perú.',
        beatsCount: combinedBeats.filter((b) => b.producer.handle === 'chojin').length,
        followersCount: 1420
      });
    }

    return NextResponse.json({
      success: true,
      query,
      beats: combinedBeats.slice(0, 6),
      users: formattedUsers.slice(0, 6)
    });
  } catch (error: unknown) {
    console.error('Error en búsqueda global:', error);
    return NextResponse.json(
      { error: 'Error al procesar la búsqueda' },
      { status: 500 }
    );
  }
}
