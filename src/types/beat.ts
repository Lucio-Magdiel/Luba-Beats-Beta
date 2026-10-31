export type MusicalKey =
  | 'C Major' | 'C Minor'
  | 'C# Major' | 'C# Minor'
  | 'D Major' | 'D Minor'
  | 'D# Major' | 'D# Minor'
  | 'E Major' | 'E Minor'
  | 'F Major' | 'F Minor'
  | 'F# Major' | 'F# Minor'
  | 'G Major' | 'G Minor'
  | 'G# Major' | 'G# Minor'
  | 'A Major' | 'A Minor'
  | 'A# Major' | 'A# Minor'
  | 'B Major' | 'B Minor';

export type MusicGenre =
  | 'Trap'
  | 'Boombap'
  | 'Drill'
  | 'Reggaeton'
  | 'R&B'
  | 'Pop'
  | 'Electrónica'
  | 'Afrobeat'
  | 'Dancehall'
  | 'Synthwave'
  | 'Corridos Tumbados'
  | 'Jersey Club';

export type MusicMood =
  | 'Oscuro (Dark)'
  | 'Energético'
  | 'Melancólico'
  | 'Chill / Relax'
  | 'Romántico'
  | 'Agresivo'
  | 'Trippy';

export type LicenseTier = 'basic' | 'premium' | 'exclusive';

export type ItemType = 'beat' | 'musica';

export interface LicenseOption {
  tier: LicenseTier;
  name: string;
  price: number; // in USD or converted
  pricePEN: number; // in Soles (PEN)
  format: string; // 'MP3' | 'MP3 + WAV' | 'MP3 + WAV + Track Stems'
  streamsLimit: string;
  musicVideoLimit: string;
  radioBroadcasting: boolean;
  forProfitPerformances: boolean;
  description: string;
}

export const defaultLicenses = (basePrice: number): LicenseOption[] => [
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

export interface Producer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  country: string;
  totalBeats: number;
  role?: 'productor' | 'artista';
}

export interface Beat {
  id: string;
  title: string;
  slug: string;
  type: ItemType; // 'beat' (instrumental) | 'musica' (canción completa / demo)
  producer: Producer;
  genre: MusicGenre;
  bpm: number;
  key: MusicalKey;
  mood: MusicMood;
  tags: string[];
  duration: number; // in seconds
  durationFormatted: string; // e.g. "3:14"
  audioPreviewUrl: string; // working preview stream
  coverUrl: string;
  waveform: number[]; // Normalized peak values 0.05 to 1.0 for visual rendering
  priceFrom: number;
  priceFromPEN: number;
  plays: number;
  likes: number;
  isFeatured?: boolean;
  isFree?: boolean; // Para música / demos gratuitos
  isFreeDownload?: boolean;
  createdAt: string;
  licenses: LicenseOption[];
}

export interface FilterState {
  search: string;
  genre: string;
  bpmRange: [number, number];
  key: string;
  mood: string;
  categoryTab: 'todo' | 'beat' | 'musica';
  sortBy: 'trending' | 'popular' | 'newest' | 'price_low' | 'price_high';
}
