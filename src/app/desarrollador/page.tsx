import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Code2,
  Terminal,
  Cpu,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Music2,
  Database,
  CreditCard,
  Smartphone,
  Flame,
} from 'lucide-react';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'Desarrollador: Magdiel UCHIHA | Luba Beats',
  description:
    'Perfil oficial del desarrollador y arquitecto de software Magdiel UCHIHA (Lucio Magdiel), creador de la plataforma Luba Beats.',
};

export default function DesarrolladorPage() {
  const skills = [
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
  ];

  const highlights = [
    {
      icon: Music2,
      title: 'Motor de Audio Persistente & Streaming',
      desc: 'Reproductor de audio global no intrusivo con soporte de colas automáticas, visualizador de onda sonora, bucles continuos y versión mini-player optimizada para móviles.',
      badge: 'Multimedia Engine',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      icon: CreditCard,
      title: 'Infraestructura Fintech con Culqi Perú',
      desc: 'Integración end-to-end para cobros con tarjetas bancarias internacionales (3D Secure 2.0), generación de códigos CIP en efectivo (PagoEfectivo) y soporte nativo para Yape y Plin.',
      badge: 'Fintech & Checkout',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      icon: Database,
      title: 'Migración y Escalabilidad en la Nube',
      desc: 'Diseño de base de datos relacional migrada a Supabase PostgreSQL con pool de conexiones y direct URL, garantizando transacciones seguras y control de accesos por roles (RBAC).',
      badge: 'Cloud & Database',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      icon: Smartphone,
      title: 'Diseño 100% Responsivo & Mobile-First',
      desc: 'Adaptabilidad fluida en smartphones y tablets, modales táctiles ergonómicos, navegación modular tipo mensajería y consumo eficiente de datos para los creadores de música.',
      badge: 'Mobile UX',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-24 pt-8 selection:bg-purple-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute top-1/3 right-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-[180px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md hover:border-white/20 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver a Luba Beats</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-[11px] font-mono font-bold text-purple-300">
            <Terminal className="h-3.5 w-3.5 text-purple-400" />
            <span>developer.profile.v1</span>
          </span>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          {/* Top banner glowing line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
            {/* Avatar / Uchiha Sigil Symbol */}
            <div className="relative group">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl p-1 bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 shadow-xl shadow-purple-900/40">
                <div className="h-full w-full rounded-[22px] bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
                  <Flame className="h-12 w-12 text-pink-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mt-1">
                    UCHIHA
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-zinc-950 p-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 fill-zinc-950" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Magdiel <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">UCHIHA</span>
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  Lead Developer
                </span>
              </div>

              <p className="text-xs sm:text-sm font-mono text-purple-300">
                Lucio Magdiel • Full-Stack Software Engineer & Software Architect
              </p>

              <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl pt-1">
                Arquitecto y creador técnico detrás del ecosistema <strong className="text-white">Luba Beats</strong>. Especializado en el desarrollo de aplicaciones web interactivas de alto rendimiento, sistemas de procesamiento de audio en tiempo real, microservicios en la nube e integraciones de pagos electrónicos.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <a
                  href="https://github.com/Lucio-Magdiel"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                >
                  <GithubIcon className="h-4 w-4" />
                  <span>GitHub: @Lucio-Magdiel</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                <a
                  href="https://github.com/Lucio-Magdiel/Luba-Beats-Beta"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95"
                >
                  <Code2 className="h-4 w-4" />
                  <span>Ver Repositorio del Proyecto</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Highlights in Luba Beats */}
        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Arquitectura & Desarrollo
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Pilares Tecnológicos de Luba Beats
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((h, idx) => {
              const Icon = h.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 space-y-2.5 transition-all hover:border-white/20 hover:bg-zinc-900/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                      <Icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${h.color}`}>
                      {h.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{h.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stack & Skills Grid */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4">
            <Cpu className="h-4 w-4" />
            <span>Tecnologías & Herramientas Dominadas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-zinc-200">{s.name}</span>
                </div>
                <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/5">
                  {s.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Closing */}
        <div className="mt-10 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-zinc-900 to-cyan-950/20 p-6 text-center space-y-3">
          <h3 className="text-lg font-bold text-white">¿Tienes preguntas o deseas colaborar?</h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Luba Beats es un proyecto activo y en constante evolución para revolucionar la industria musical en Latinoamérica.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-5 py-2.5 text-xs font-bold text-white transition-all"
            >
              <Music2 className="h-4 w-4 text-purple-400" />
              <span>Explorar el Marketplace</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
