# 🏗️ Arquitectura Técnica - Luba Beats Beta

## 📑 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Stack Tecnológico Detallado](#stack-tecnológico-detallado)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Base de Datos](#base-de-datos)
6. [Sistema de Audio](#sistema-de-audio)
7. [Seguridad](#seguridad)
8. [Performance](#performance)
9. [Escalabilidad](#escalabilidad)
10. [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)

---

## Visión General

Luba Beats Beta está construido con una arquitectura moderna de **Jamstack** utilizando Next.js 16 con el App Router. La plataforma sigue principios de **Clean Architecture** y **Domain-Driven Design (DDD)** para mantener el código escalable y mantenible.

### Principios Arquitectónicos

1. **Server-First**: Maximizar Server Components para mejor performance
2. **Progressive Enhancement**: La app funciona sin JS, mejora con JS
3. **Type Safety**: TypeScript en todo el stack (frontend + backend)
4. **Component Composition**: Componentes pequeños, reutilizables y testeables
5. **Performance Budget**: Cada página < 200KB, TTI < 1.5s
6. **Accessibility First**: WCAG 2.1 Level AA desde el día 1

---

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                         EDGE LAYER                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  │
│  │ Vercel  │  │   CDN   │  │  Edge   │  │   WAF/DDoS   │  │
│  │  Edge   │  │ (Images)│  │Functions│  │  Protection  │  │
│  └─────────┘  └─────────┘  └─────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (Next.js)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Server Components                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │ │
│  │  │  Pages   │  │ Layouts  │  │  Server Actions     │   │ │
│  │  │  (RSC)   │  │  (RSC)   │  │   (Form Actions)    │   │ │
│  │  └──────────┘  └──────────┘  └────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Client Components (Islands)                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐    │ │
│  │  │  Audio   │  │  Forms   │  │   Interactive UI    │   │ │
│  │  │  Player  │  │ (React)  │  │   (Modals, etc.)    │   │ │
│  │  └──────────┘  └──────────┘  └────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   REST API  │  │    tRPC     │  │   GraphQL API    │   │
│  │   Routes    │  │  Endpoints  │  │   (Apollo)       │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Webhooks   │  │    Auth     │  │   Middleware     │   │
│  │  (Stripe)   │  │ (NextAuth)  │  │   (Rate Limit)   │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Business  │  │   Payment   │  │   Upload         │   │
│  │   Logic     │  │   Service   │  │   Service        │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │    Email    │  │   Search    │  │   Analytics      │   │
│  │   Service   │  │   Service   │  │   Service        │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │  PostgreSQL │  │    Redis    │  │   Cloudinary     │     │
│  │  (Primary)  │  │   (Cache)   │  │   (Media CDN)    │     │
│  └─────────────┘  └─────────────┘  └──────────────────┘     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │     S3      │  │  Elasticsearch│ │   Vector DB     │     │
│  │  (Backups)  │  │   (Search)  │  │   (AI/ML)        │     │
│  └─────────────┘  └─────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │   Stripe    │  │   SendGrid  │  │   Google OAuth   │     │
│  └─────────────┘  └─────────────┘  └──────────────────┘     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │   Sentry    │  │   PostHog   │  │   Pusher/WS      │     │
│  └─────────────┘  └─────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico Detallado

### Frontend Stack

#### **Next.js 16 - Framework Core**
- **App Router**: Sistema de routing basado en carpetas
- **Server Components**: Renderizado en servidor por defecto
- **Server Actions**: Mutaciones sin necesidad de API routes
- **Streaming SSR**: Renderizado progresivo con Suspense
- **Parallel Routes**: Carga paralela de secciones
- **Intercepting Routes**: Modales con URLs
- **Route Handlers**: API endpoints
- **Middleware**: Lógica en edge antes de renderizar

#### **React 19 - UI Library**
```typescript
// Ejemplo de Server Component
async function BeatsGrid({ genre }: { genre: string }) {
  const beats = await prisma.beat.findMany({
    where: { genre },
    include: { producer: true }
  });
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {beats.map(beat => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}

// Ejemplo de Client Component
'use client'
function AudioPlayer({ beatId }: { beatId: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const { play, pause } = useAudioPlayer();
  
  return (
    <button onClick={() => isPlaying ? pause() : play(beatId)}>
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}
```

#### **TypeScript 5 - Type Safety**
```typescript
// Tipos estrictos para toda la aplicación
type Beat = {
  id: string;
  title: string;
  genre: Genre;
  bpm: number;
  price: number;
  audioUrl: string;
  waveformData: number[];
  producer: Producer;
  createdAt: Date;
};

type UserRole = 'SUPER_ADMIN' | 'PRODUCER' | 'ARTIST' | 'BUYER';

type APIResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

#### **Tailwind CSS 4 - Styling**
- Utility-first approach
- Custom design system
- Dark mode con CSS variables
- Responsive por defecto
- JIT compiler para performance

```css
/* Configuración del sistema de diseño */
@theme {
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --color-accent: #ec4899;
  --font-display: 'Geist Sans', sans-serif;
  --font-mono: 'Geist Mono', monospace;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
}
```

### Backend Stack

#### **Prisma ORM**
```prisma
// Schema simplificado
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          UserRole  @default(BUYER)
  profileImage  String?
  beats         Beat[]    // Si es productor
  purchases     Purchase[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([email])
  @@index([role])
}

model Beat {
  id            String    @id @default(cuid())
  title         String
  description   String?
  genre         Genre
  bpm           Int
  key           String?
  price         Decimal   @db.Decimal(10, 2)
  audioUrl      String    // Cloudinary URL
  waveform      Json      // Array de amplitudes
  coverImage    String?
  tags          String[]
  producerId    String
  producer      User      @relation(fields: [producerId], references: [id])
  purchases     Purchase[]
  plays         Int       @default(0)
  downloads     Int       @default(0)
  status        BeatStatus @default(PENDING)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([genre])
  @@index([producerId])
  @@index([status])
  @@fulltext([title, description])
}

model Purchase {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  beatId        String
  beat          Beat      @relation(fields: [beatId], references: [id])
  licenseType   LicenseType
  price         Decimal   @db.Decimal(10, 2)
  stripePaymentId String  @unique
  downloadUrl   String?   // Link temporal de descarga
  createdAt     DateTime  @default(now())
  
  @@index([userId])
  @@index([beatId])
  @@unique([userId, beatId])
}

enum UserRole {
  SUPER_ADMIN
  PRODUCER
  ARTIST
  BUYER
}

enum Genre {
  TRAP
  BOOM_BAP
  RNB
  POP
  DRILL
  REGGAETON
  AFROBEAT
  LOFI
  EDM
  ROCK
  JAZZ
}

enum LicenseType {
  BASIC
  PREMIUM
  EXCLUSIVE
  UNLIMITED
}

enum BeatStatus {
  PENDING
  APPROVED
  REJECTED
  HIDDEN
}
```

#### **Redis - Caching Strategy**
```typescript
// Cache de beats populares
export async function getPopularBeats() {
  const cached = await redis.get('beats:popular');
  if (cached) return JSON.parse(cached);
  
  const beats = await prisma.beat.findMany({
    where: { status: 'APPROVED' },
    orderBy: { plays: 'desc' },
    take: 20,
    include: { producer: true }
  });
  
  await redis.set('beats:popular', JSON.stringify(beats), {
    ex: 300 // 5 minutos
  });
  
  return beats;
}

// Rate limiting
export async function checkRateLimit(userId: string, action: string) {
  const key = `ratelimit:${userId}:${action}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, 60); // 1 minuto
  }
  
  if (current > 10) {
    throw new Error('Rate limit exceeded');
  }
}
```

### Sistema de Audio

#### **Howler.js - Audio Player**
```typescript
// Custom audio player hook
export function useAudioPlayer() {
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Howl | null>(null);
  
  const play = useCallback((beat: Beat) => {
    if (soundRef.current) {
      soundRef.current.unload();
    }
    
    soundRef.current = new Howl({
      src: [beat.audioUrl],
      html5: true,
      format: ['mp3', 'wav'],
      onplay: () => setIsPlaying(true),
      onend: () => setIsPlaying(false),
      onpause: () => setIsPlaying(false)
    });
    
    soundRef.current.play();
    setCurrentBeat(beat);
    
    // Track play count
    trackPlay(beat.id);
  }, []);
  
  const pause = useCallback(() => {
    soundRef.current?.pause();
  }, []);
  
  return { play, pause, currentBeat, isPlaying };
}
```

#### **Wavesurfer.js - Waveform Visualization**
```typescript
'use client'
export function Waveform({ audioUrl, waveformData }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#6366f1',
      progressColor: '#8b5cf6',
      cursorColor: '#ec4899',
      barWidth: 2,
      barRadius: 3,
      barGap: 1,
      height: 80,
      normalize: true,
      backend: 'WebAudio'
    });
    
    // Cargar waveform pre-calculado
    if (waveformData) {
      wavesurferRef.current.load(audioUrl, waveformData);
    } else {
      wavesurferRef.current.load(audioUrl);
    }
    
    return () => wavesurferRef.current?.destroy();
  }, [audioUrl, waveformData]);
  
  return <div ref={containerRef} className="w-full" />;
}
```

### Authentication & Security

#### **NextAuth.js v5**
```typescript
// auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });
        
        if (!user) return null;
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (!isValid) return null;
        
        return user;
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  }
});

// Middleware para proteger rutas
export async function requireAuth(requiredRole?: UserRole) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  if (requiredRole && session.user.role !== requiredRole) {
    redirect('/unauthorized');
  }
  
  return session;
}
```

### Payment Processing

#### **Stripe Integration**
```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Crear checkout session
export async function createCheckoutSession(
  userId: string,
  beatId: string,
  licenseType: LicenseType
) {
  const beat = await prisma.beat.findUnique({
    where: { id: beatId },
    include: { producer: true }
  });
  
  if (!beat) throw new Error('Beat not found');
  
  const price = calculatePrice(beat.price, licenseType);
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: beat.title,
          description: `${licenseType} License`,
          images: [beat.coverImage],
        },
        unit_amount: Math.round(price * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/beats/${beatId}`,
    metadata: {
      userId,
      beatId,
      licenseType,
    },
  });
  
  return session;
}

// Webhook handler
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }
}
```

---

## Patrones de Diseño

### 1. Repository Pattern
```typescript
// repositories/beat.repository.ts
export class BeatRepository {
  async findById(id: string) {
    return prisma.beat.findUnique({ where: { id } });
  }
  
  async findByProducer(producerId: string) {
    return prisma.beat.findMany({
      where: { producerId },
      orderBy: { createdAt: 'desc' }
    });
  }
  
  async search(query: string, filters: BeatFilters) {
    return prisma.beat.findMany({
      where: {
        AND: [
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
          filters.genre && { genre: filters.genre },
          filters.minPrice && { price: { gte: filters.minPrice } },
          filters.maxPrice && { price: { lte: filters.maxPrice } }
        ].filter(Boolean)
      }
    });
  }
}
```

### 2. Service Pattern
```typescript
// services/beat.service.ts
export class BeatService {
  constructor(
    private beatRepo: BeatRepository,
    private uploadService: UploadService,
    private analyticsService: AnalyticsService
  ) {}
  
  async createBeat(producerId: string, data: CreateBeatDTO) {
    // 1. Upload audio to Cloudinary
    const audioUrl = await this.uploadService.uploadAudio(data.audioFile);
    
    // 2. Generate waveform
    const waveform = await this.generateWaveform(data.audioFile);
    
    // 3. Extract BPM and key
    const { bpm, key } = await this.analyzeAudio(data.audioFile);
    
    // 4. Create beat in database
    const beat = await this.beatRepo.create({
      ...data,
      audioUrl,
      waveform,
      bpm,
      key,
      producerId
    });
    
    // 5. Track event
    await this.analyticsService.track('beat_created', { beatId: beat.id });
    
    return beat;
  }
}
```

### 3. Factory Pattern
```typescript
// factories/license.factory.ts
export class LicenseFactory {
  static create(type: LicenseType, basePrice: number): License {
    switch (type) {
      case 'BASIC':
        return new BasicLicense(basePrice);
      case 'PREMIUM':
        return new PremiumLicense(basePrice * 3);
      case 'EXCLUSIVE':
        return new ExclusiveLicense(basePrice * 10);
      default:
        throw new Error('Invalid license type');
    }
  }
}

class BasicLicense implements License {
  constructor(public price: number) {}
  
  get terms() {
    return {
      downloads: 1,
      streams: 10000,
      commercialUse: false,
      stemsIncluded: false
    };
  }
}
```

---

## Performance

### Code Splitting Strategy
```typescript
// Lazy loading de componentes pesados
const AudioEditor = dynamic(() => import('@/components/AudioEditor'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
});

// Prefetch de rutas críticas
<Link href="/browse" prefetch={true}>
  Explorar Beats
</Link>
```

### Image Optimization
```typescript
// Next.js Image con optimización automática
<Image
  src={beat.coverImage}
  alt={beat.title}
  width={400}
  height={400}
  quality={80}
  placeholder="blur"
  blurDataURL={beat.blurHash}
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

### Bundle Analysis
```bash
# Analizar tamaño del bundle
pnpm build
pnpm analyze

# Objetivos:
# - First Load JS: < 200KB
# - Route JS: < 50KB
# - Total Bundle: < 1MB
```

---

## Escalabilidad

### Database Scaling
- **Read Replicas**: PostgreSQL con 3 read replicas
- **Connection Pooling**: PgBouncer para gestionar conexiones
- **Partitioning**: Tablas particionadas por fecha
- **Archiving**: Mover datos antiguos a cold storage

### Caching Layers
1. **Browser Cache**: Assets estáticos (1 año)
2. **CDN Cache**: Images y audio (1 mes)
3. **Redis Cache**: Queries frecuentes (5-15 min)
4. **Next.js Cache**: ISR pages (on-demand)

### Horizontal Scaling
- **Vercel Functions**: Auto-scaling serverless
- **Database**: Scaling vertical + read replicas
- **Redis**: Redis Cluster para distribución
- **Media**: Cloudinary CDN global

---

## Monitoreo y Observabilidad

### Metrics Dashboard
```typescript
// Métricas clave a monitorear
const metrics = {
  // Performance
  TTFB: '< 200ms',
  FCP: '< 1s',
  LCP: '< 2.5s',
  CLS: '< 0.1',
  
  // Business
  activeUsers: 'real-time',
  revenue: 'daily',
  conversionRate: 'weekly',
  
  // Technical
  errorRate: '< 0.1%',
  apiLatency: '< 500ms',
  databaseConnections: 'real-time',
  cacheHitRate: '> 80%'
};
```

### Error Tracking (Sentry)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
});
```

---

## Conclusión

Esta arquitectura está diseñada para:
- ✅ Escalar a millones de usuarios
- ✅ Mantener latencias < 500ms
- ✅ Soportar 99.9% uptime
- ✅ Facilitar el desarrollo y mantenimiento
- ✅ Cumplir estándares de seguridad empresarial

**Próximos pasos**: Ver [GETTING_STARTED.md](./GETTING_STARTED.md) para comenzar el desarrollo.
