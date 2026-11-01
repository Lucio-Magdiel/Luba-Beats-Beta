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

export async function getBeatBySlugOrId(slugOrId: string): Promise<Beat | null> {
  try {
    // 1. Intentar extraer ID numérico si termina en -ID o si es un ID directo
    const idMatch = slugOrId.match(/-(\d+)$/) || slugOrId.match(/^(\d+)$/);
    const numericId = idMatch ? parseInt(idMatch[1], 10) : null;

    let dbBeat = null;

    if (numericId) {
      dbBeat = await prisma.beats.findFirst({
        where: { id: numericId },
        include: {
          usuarios: true,
        },
      });
    }

    if (!dbBeat) {
      // Buscar por título aproximado
      const titleSearch = slugOrId.replace(/-\d+$/, '').replace(/-/g, ' ');
      dbBeat = await prisma.beats.findFirst({
        where: {
          titulo: {
            contains: titleSearch,
          },
        },
        include: {
          usuarios: true,
        },
      });
    }

    if (dbBeat) {
      if (dbBeat.estado === 'eliminado' || dbBeat.usuarios?.estado === 'suspendido') {
        return null;
      }

      const priceNum = Number(dbBeat.precio) || 0;
      const isFree = dbBeat.tipo === 'musica' || priceNum === 0;

      let durationSeconds = 180;
      if (dbBeat.duracion && dbBeat.duracion.includes(':')) {
        const [mins, secs] = dbBeat.duracion.split(':').map(Number);
        if (!isNaN(mins) && !isNaN(secs)) {
          durationSeconds = mins * 60 + secs;
        }
      }

      return {
        id: String(dbBeat.id),
        title: dbBeat.titulo,
        slug: dbBeat.titulo
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-') + `-${dbBeat.id}`,
        type: dbBeat.tipo as ItemType,
        producer: {
          id: String(dbBeat.usuarios.id),
          name: dbBeat.usuarios.nombre_usuario,
          handle: dbBeat.usuarios.nombre_usuario,
          avatar: dbBeat.usuarios.foto_perfil || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
          verified: !!dbBeat.usuarios.verificado_google,
          country: 'Perú',
          totalBeats: 1,
          role: dbBeat.usuarios.tipo === 'artista' ? 'artista' : 'productor',
        },
        genre: (dbBeat.genero as MusicGenre) || 'Trap',
        bpm: dbBeat.bpm || 140,
        key: (dbBeat.nota_musical as MusicalKey) || 'C Minor',
        mood: (dbBeat.mood as MusicMood) || 'Energético',
        tags: [dbBeat.genero || 'Trap', `${dbBeat.bpm || 140} BPM`, dbBeat.nota_musical || 'C Minor'],
        duration: durationSeconds,
        durationFormatted: dbBeat.duracion || '03:00',
        audioPreviewUrl: dbBeat.archivo_preview || dbBeat.archivo_full || 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761544297/chojin/beats/beat_1.wav',
        coverUrl: dbBeat.archivo_visual || 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/covers/cover_1.jpg',
        waveform: generateWaveform(dbBeat.id),
        priceFrom: isFree ? 0 : priceNum,
        priceFromPEN: isFree ? 0 : Math.round(priceNum * 3.75),
        plays: Number((dbBeat as any).reproducciones ?? 0),
        likes: 18 + dbBeat.id * 3,
        isFeatured: dbBeat.id % 2 === 0,
        isFree,
        isFreeDownload: isFree,
        createdAt: dbBeat.fecha_subida?.toISOString() || new Date().toISOString(),
        licenses: isFree ? [] : defaultLicenses(priceNum > 0 ? priceNum : 29.99),
      };
    }
  } catch (err) {
    console.error('Error fetching beat by slug from DB:', err);
  }

  return null;
}
