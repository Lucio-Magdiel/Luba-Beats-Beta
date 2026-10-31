import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export interface DeveloperProfileData {
  name: string;
  alias: string;
  title: string;
  bio: string;
  githubUrl: string;
  repoUrl: string;
  emailContact?: string;
  highlights: Array<{
    title: string;
    desc: string;
    badge: string;
    color: string;
  }>;
  skills: Array<{
    name: string;
    category: string;
  }>;
}

export const DEFAULT_DEVELOPER_PROFILE: DeveloperProfileData = {
  name: 'Magdiel UCHIHA',
  alias: 'Lucio Magdiel',
  title: 'Lead Developer & Software Architect',
  bio: 'Arquitecto y creador técnico detrás del ecosistema Luba Beats. Especializado en el desarrollo de aplicaciones web interactivas de alto rendimiento, sistemas de procesamiento de audio en tiempo real, microservicios en la nube e integraciones de pagos electrónicos.',
  githubUrl: 'https://github.com/Lucio-Magdiel',
  repoUrl: 'https://github.com/Lucio-Magdiel/Luba-Beats-Beta',
  emailContact: 'magdiel@lubabeats.com',
  highlights: [
    {
      title: 'Motor de Audio Persistente & Streaming',
      desc: 'Reproductor de audio global no intrusivo con soporte de colas automáticas, visualizador de onda sonora, bucles continuos y versión mini-player optimizada para móviles.',
      badge: 'Multimedia Engine',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      title: 'Infraestructura Fintech con Culqi Perú',
      desc: 'Integración end-to-end para cobros con tarjetas bancarias internacionales (3D Secure 2.0), generación de códigos CIP en efectivo (PagoEfectivo) y soporte nativo para Yape y Plin.',
      badge: 'Fintech & Checkout',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Migración y Escalabilidad en la Nube',
      desc: 'Diseño de base de datos relacional migrada a Supabase PostgreSQL con pool de conexiones y direct URL, garantizando transacciones seguras y control de accesos por roles (RBAC).',
      badge: 'Cloud & Database',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      title: 'Diseño 100% Responsivo & Mobile-First',
      desc: 'Adaptabilidad fluida en smartphones y tablets, modales táctiles ergonómicos, navegación modular tipo mensajería y consumo eficiente de datos para los creadores de música.',
      badge: 'Mobile UX',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  ],
  skills: [
    { name: 'Next.js 16 (App Router & Turbopack)', category: 'Frontend & SSR' },
    { name: 'React 19 & TypeScript', category: 'Frontend' },
    { name: 'Tailwind CSS v4 & Generative UI', category: 'Styling' },
    { name: 'PostgreSQL & Prisma 5 ORM', category: 'Base de Datos' },
    { name: 'Supabase Cloud Infrastructure', category: 'Cloud' },
    { name: 'Pasarela de Pagos Culqi (3DS2, Yape, CIP)', category: 'Fintech' },
    { name: 'HTML5 Audio & Waveform Visualizer', category: 'Multimedia' },
    { name: 'Cloudinary CDN (Video/Audio/Images)', category: 'Storage' },
    { name: 'NextAuth v5 (Edge Auth & Sessions)', category: 'Seguridad' },
    { name: 'Despliegue Continuo Vercel & Git', category: 'DevOps' },
  ],
};

// GET: Obtener perfil de desarrollador
export async function GET() {
  try {
    const record = await prisma.config_sistema.findUnique({
      where: { clave: 'desarrollador_info' },
    });

    if (!record) {
      return NextResponse.json({ profile: DEFAULT_DEVELOPER_PROFILE });
    }

    const parsed = JSON.parse(record.valor);
    return NextResponse.json({ profile: { ...DEFAULT_DEVELOPER_PROFILE, ...parsed } });
  } catch (error) {
    console.error('Error al obtener perfil de desarrollador:', error);
    return NextResponse.json({ profile: DEFAULT_DEVELOPER_PROFILE });
  }
}

// PUT: Modificar perfil de desarrollador (Solo Super Admin)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Solo el Super Admin puede editar la vista de desarrollador.' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Sanitizar y validar los datos ingresados
    const profileToSave: DeveloperProfileData = {
      name: String(body.name || DEFAULT_DEVELOPER_PROFILE.name).trim(),
      alias: String(body.alias || DEFAULT_DEVELOPER_PROFILE.alias).trim(),
      title: String(body.title || DEFAULT_DEVELOPER_PROFILE.title).trim(),
      bio: String(body.bio || DEFAULT_DEVELOPER_PROFILE.bio).trim(),
      githubUrl: String(body.githubUrl || DEFAULT_DEVELOPER_PROFILE.githubUrl).trim(),
      repoUrl: String(body.repoUrl || DEFAULT_DEVELOPER_PROFILE.repoUrl).trim(),
      emailContact: String(body.emailContact || DEFAULT_DEVELOPER_PROFILE.emailContact || '').trim(),
      highlights: Array.isArray(body.highlights) && body.highlights.length > 0 ? body.highlights : DEFAULT_DEVELOPER_PROFILE.highlights,
      skills: Array.isArray(body.skills) && body.skills.length > 0 ? body.skills : DEFAULT_DEVELOPER_PROFILE.skills,
    };

    await prisma.config_sistema.upsert({
      where: { clave: 'desarrollador_info' },
      update: {
        valor: JSON.stringify(profileToSave),
        updated_at: new Date(),
      },
      create: {
        clave: 'desarrollador_info',
        valor: JSON.stringify(profileToSave),
      },
    });

    return NextResponse.json({
      message: 'Vista de desarrollador actualizada exitosamente.',
      profile: profileToSave,
    });
  } catch (error) {
    console.error('Error al actualizar vista de desarrollador:', error);
    return NextResponse.json({ error: 'Error interno al guardar los cambios.' }, { status: 500 });
  }
}
