import { Beat } from '@/types/beat';

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

export const MOCK_BEATS: Beat[] = [
  // ==========================================
  // 🟢 BEATS (INSTRUMENTALES / PRODUCTORES)
  // ==========================================
  {
    id: 'beat-1',
    title: 'Mongo de B',
    slug: 'mongo-de-b',
    type: 'beat',
    producer: {
      id: 'prod-1',
      name: 'chojin',
      handle: 'chojin',
      avatar: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/profiles/profile_2.png',
      verified: true,
      country: 'Perú',
      totalBeats: 42,
      role: 'productor'
    },
    genre: 'Trap',
    bpm: 140,
    key: 'F Minor',
    mood: 'Energético',
    tags: ['Trap Latino', '808 Hard', 'Eladio Carrion', 'Punchy Drums'],
    duration: 190,
    durationFormatted: '3:10',
    audioPreviewUrl: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761695053/chojin/beats/beat_1761694896_Mongo%20de%20B.mp3',
    coverUrl: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761695055/chojin/visuales/beat_visual_1761694896_Mongo%20de%20B.jpg',
    waveform: generateWaveform(2.4),
    priceFrom: 25.00,
    priceFromPEN: 94,
    plays: 28400,
    likes: 2150,
    isFeatured: true,
    createdAt: '2026-03-20',
    licenses: defaultLicenses(25.00)
  },
  {
    id: 'beat-2',
    title: 'Diamantes',
    slug: 'diamantes',
    type: 'beat',
    producer: {
      id: 'prod-1',
      name: 'chojin',
      handle: 'chojin',
      avatar: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/profiles/profile_2.png',
      verified: true,
      country: 'Perú',
      totalBeats: 42,
      role: 'productor'
    },
    genre: 'Drill',
    bpm: 142,
    key: 'C# Minor',
    mood: 'Oscuro (Dark)',
    tags: ['UK Drill', 'Dark Piano', 'Central Cee', 'Sliding 808'],
    duration: 185,
    durationFormatted: '3:05',
    audioPreviewUrl: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761629585/chojin/beats/beat_3_1761629422.wav',
    coverUrl: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761629589/chojin/visuales/beat_visual_3_1761629437.jpg',
    waveform: generateWaveform(1.8),
    priceFrom: 35.00,
    priceFromPEN: 131,
    plays: 21300,
    likes: 1980,
    isFeatured: true,
    createdAt: '2026-03-22',
    licenses: defaultLicenses(35.00)
  },
  {
    id: 'beat-3',
    title: 'Una noche en Miami',
    slug: 'una-noche-en-miami',
    type: 'beat',
    producer: {
      id: 'prod-1',
      name: 'chojin',
      handle: 'chojin',
      avatar: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761705060/chojin/profiles/profile_9.jpg',
      verified: true,
      country: 'Perú',
      totalBeats: 42,
      role: 'productor'
    },
    genre: 'Reggaeton',
    bpm: 98,
    key: 'C# Minor',
    mood: 'Romántico',
    tags: ['Bad Bunny', 'Feid', 'Synth Lead', 'Perreo'],
    duration: 178,
    durationFormatted: '2:58',
    audioPreviewUrl: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761705547/chojin/beats/beat_1761705545_Una%20noche%20en%20Miami.wav',
    coverUrl: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761705550/chojin/visuales/beat_visual_1761705545_Una%20noche%20en%20Miami.jpg',
    waveform: generateWaveform(3.2),
    priceFrom: 30.00,
    priceFromPEN: 112,
    plays: 26800,
    likes: 2420,
    isFeatured: true,
    createdAt: '2026-03-15',
    licenses: defaultLicenses(30.00)
  },
  {
    id: 'beat-4',
    title: 'Dinero Limpio (808 Bando)',
    slug: 'dinero-limpio',
    type: 'beat',
    producer: {
      id: 'prod-1',
      name: 'chojin',
      handle: 'chojin',
      avatar: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761705060/chojin/profiles/profile_9.jpg',
      verified: true,
      country: 'Perú',
      totalBeats: 42,
      role: 'productor'
    },
    genre: 'Trap',
    bpm: 130,
    key: 'D Minor',
    mood: 'Oscuro (Dark)',
    tags: ['Street Trap', 'Money Stack', 'Bando', 'Sub Bass'],
    duration: 160,
    durationFormatted: '2:40',
    audioPreviewUrl: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761704988/chojin/beats/beat_1761704987_nose.wav',
    coverUrl: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761705343/chojin/visuales/beat_visual_9_1761705343.jpg',
    waveform: generateWaveform(4.1),
    priceFrom: 20.00,
    priceFromPEN: 75,
    plays: 14200,
    likes: 1310,
    isFeatured: false,
    createdAt: '2026-04-05',
    licenses: defaultLicenses(20.00)
  },

  // ==========================================
  // 🟣 MÚSICA (CANCIONES / ARTISTAS / DEMOS)
  // ==========================================
  {
    id: 'music-1',
    title: 'Sueños de Medianoche',
    slug: 'suenos-de-medianoche',
    type: 'musica',
    producer: {
      id: 'art-1',
      name: 'artista_demo',
      handle: 'artista_demo',
      avatar: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761515064/chojin/profiles/profile_4.jpg',
      verified: true,
      country: 'Perú',
      totalBeats: 14,
      role: 'artista'
    },
    genre: 'R&B',
    bpm: 85,
    key: 'E Minor',
    mood: 'Melancólico',
    tags: ['Lo-Fi / R&B', 'Canción Vocal', 'Vibes', 'Nocturno'],
    duration: 195,
    durationFormatted: '3:15',
    audioPreviewUrl: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761630136/chojin/beats/beat_3_1761629976.wav',
    coverUrl: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761630139/chojin/visuales/beat_visual_3_1761629987.jpg',
    waveform: generateWaveform(5.5),
    priceFrom: 0,
    priceFromPEN: 0,
    isFree: true,
    plays: 34500,
    likes: 3120,
    isFeatured: true,
    createdAt: '2026-03-25',
    licenses: []
  },
  {
    id: 'music-2',
    title: 'Dopamina',
    slug: 'dopamina',
    type: 'musica',
    producer: {
      id: 'art-1',
      name: 'artista_demo',
      handle: 'artista_demo',
      avatar: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761710807/chojin/profiles/profile_10.jpg',
      verified: true,
      country: 'Perú',
      totalBeats: 14,
      role: 'artista'
    },
    genre: 'Pop',
    bpm: 128,
    key: 'A Minor',
    mood: 'Energético',
    tags: ['Pop / Electrónica', 'Hit Radial', 'Sintetizadores', 'Voz'],
    duration: 175,
    durationFormatted: '2:55',
    audioPreviewUrl: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761710061/chojin/musica/musica_1761710057_Dopamina.wav',
    coverUrl: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761710807/chojin/profiles/profile_10.jpg',
    waveform: generateWaveform(6.2),
    priceFrom: 0,
    priceFromPEN: 0,
    isFree: true,
    plays: 41200,
    likes: 3890,
    isFeatured: true,
    createdAt: '2026-04-01',
    licenses: []
  },
  {
    id: 'music-3',
    title: 'Cyberpunk Memories',
    slug: 'cyberpunk-memories',
    type: 'musica',
    producer: {
      id: 'art-2',
      name: 'Luba Sounds',
      handle: 'lubasounds',
      avatar: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544297/chojin/profiles/profile_2.png',
      verified: true,
      country: 'Perú',
      totalBeats: 28,
      role: 'artista'
    },
    genre: 'Electrónica',
    bpm: 124,
    key: 'G# Minor',
    mood: 'Trippy',
    tags: ['Synthwave', 'Anime Cyber', 'Electronic Vocal', 'Future Bass'],
    duration: 180,
    durationFormatted: '3:00',
    audioPreviewUrl: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1761544168/chojin/beats/beat_1_1761544168.mp3',
    coverUrl: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761544169/chojin/visuales/beat_visual_1_1761544169.jpg',
    waveform: generateWaveform(7.0),
    priceFrom: 0,
    priceFromPEN: 0,
    isFree: true,
    plays: 19800,
    likes: 1740,
    isFeatured: false,
    createdAt: '2026-04-12',
    licenses: []
  },
  {
    id: 'music-4',
    title: 'Noches en Tokio (City Pop)',
    slug: 'noches-en-tokio',
    type: 'musica',
    producer: {
      id: 'art-1',
      name: 'artista_demo',
      handle: 'artista_demo',
      avatar: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1761515064/chojin/profiles/profile_4.jpg',
      verified: true,
      country: 'Perú',
      totalBeats: 14,
      role: 'artista'
    },
    genre: 'Synthwave',
    bpm: 105,
    key: 'A Major',
    mood: 'Chill / Relax',
    tags: ['Retro Wave', 'City Pop', 'Lo-Fi Chill', 'Sunset'],
    duration: 198,
    durationFormatted: '3:18',
    audioPreviewUrl: 'https://res.cloudinary.com/dacq9spfd/video/upload/v1792935195/chojin/beats/ouwjminrytvvdxwt8ong.mp3',
    coverUrl: 'https://res.cloudinary.com/dacq9spfd/image/upload/v1792935197/chojin/visuales/qfsvbqzzf6kkuihapulu.jpg',
    waveform: generateWaveform(8.1),
    priceFrom: 0,
    priceFromPEN: 0,
    isFree: true,
    plays: 23400,
    likes: 2110,
    isFeatured: false,
    createdAt: '2026-04-18',
    licenses: []
  }
];

export const MOCK_GENRES = [
  'Todos',
  'Trap',
  'Drill',
  'Reggaeton',
  'Boombap',
  'R&B',
  'Pop',
  'Electrónica',
  'Synthwave',
  'Afrobeat'
];

export const MOCK_KEYS = [
  'Cualquier Tonalidad',
  'C Minor', 'C Major',
  'C# Minor', 'C# Major',
  'D Minor', 'D Major',
  'D# Minor', 'D# Major',
  'E Minor', 'E Major',
  'F Minor', 'F Major',
  'F# Minor', 'F# Major',
  'G Minor', 'G Major',
  'G# Minor', 'G# Major',
  'A Minor', 'A Major',
  'A# Minor', 'A# Major',
  'B Minor', 'B Major'
];
