import { prisma } from '@/lib/prisma';
import { Beat, ItemType, MusicalKey, MusicGenre, MusicMood } from '@/types/beat';

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
    description: 'Para artistas que van a lanzar en todas las tiendas y mezclar con stems.'
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

export interface UserProfileData {
  id: number;
  nombre_usuario: string;
  tipo: string;
  foto_perfil: string | null;
  banner: string | null;
  bio: string | null;
  verificado_google: boolean;
  fecha_registro: string;
  followersCount: number;
  followingCount: number;
  cambios_usuario: number;
  beats: Beat[];
}

export async function getUserProfile(username: string): Promise<UserProfileData | null> {
  try {
    const cleanUsername = decodeURIComponent(username).trim();

    const dbUser = await prisma.usuarios.findFirst({
      where: {
        nombre_usuario: cleanUsername,
      },
      include: {
        beats: {
          where: {
            estado: 'publico',
          },
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    if (!dbUser || dbUser.estado === 'suspendido') {
      return null;
    }

    const formattedBeats: Beat[] = dbUser.beats.map((b) => {
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
        slug: b.titulo
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-') + `-${b.id}`,
        type: b.tipo as ItemType,
        producer: {
          id: String(dbUser.id),
          name: dbUser.nombre_usuario,
          handle: dbUser.nombre_usuario,
          avatar: dbUser.foto_perfil || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
          verified: !!dbUser.verificado_google,
          country: 'Perú',
          totalBeats: dbUser.beats.length,
          role: dbUser.tipo === 'artista' ? 'artista' : 'productor',
        },
        genre: (b.genero as MusicGenre) || 'Trap',
        bpm: b.bpm || 140,
        key: (b.nota_musical as MusicalKey) || 'C Minor',
        mood: (b.mood as MusicMood) || 'Energético',
        tags: [b.genero || 'Trap', `${b.bpm || 140} BPM`, b.nota_musical || 'C Minor'],
        duration: durationSeconds,
        durationFormatted: b.duracion || '03:00',
        audioPreviewUrl: b.archivo_preview || b.archivo_full || 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761544297/chojin/beats/beat_1.wav',
        coverUrl: b.archivo_visual || 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/covers/cover_1.jpg',
        waveform: generateWaveform(b.id),
        priceFrom: isFree ? 0 : priceNum,
        priceFromPEN: isFree ? 0 : Math.round(priceNum * 3.75),
        plays: Number((b as any).reproducciones ?? 0),
        likes: 18 + b.id * 3,
        isFeatured: b.id % 2 === 0,
        isFree,
        isFreeDownload: isFree,
        createdAt: b.fecha_subida?.toISOString() || new Date().toISOString(),
        licenses: isFree ? [] : defaultLicenses(priceNum > 0 ? priceNum : 29.99),
      };
    });

    const [followersCount, followingCount] = await Promise.all([
      prisma.seguidores.count({
        where: { id_seguido: dbUser.id },
      }),
      prisma.seguidores.count({
        where: { id_seguidor: dbUser.id },
      }),
    ]);

    return {
      id: dbUser.id,
      nombre_usuario: dbUser.nombre_usuario,
      tipo: dbUser.tipo,
      foto_perfil: dbUser.foto_perfil,
      banner: dbUser.banner,
      bio: dbUser.bio,
      verificado_google: !!dbUser.verificado_google,
      fecha_registro: dbUser.fecha_registro?.toISOString() || new Date().toISOString(),
      followersCount,
      followingCount,
      cambios_usuario: Number((dbUser as any).cambios_usuario) || 0,
      beats: formattedBeats,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
