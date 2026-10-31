import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Music2,
  FileText,
  ArrowLeft,
  Scale,
  Sparkles,
  Lock,
  DollarSign,
  UserX,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones & Política de 3 Strikes | Luba Beats',
  description:
    'Normas oficiales de convivencia, política de contenido musical y sistema de 3 Vidas (Strikes) en Luba Beats.',
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-24 pt-8 selection:bg-purple-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full bg-red-600/10 blur-[180px]" />
        <div className="absolute bottom-10 left-1/4 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[180px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
            <Scale className="h-3.5 w-3.5 text-purple-400" />
            <span>legal.community.v1</span>
          </span>
        </div>

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl mb-8">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400" />

          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-300">
              Términos de Uso & Reglas Comunitarias
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Términos y Condiciones de Luba Beats
          </h1>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed max-w-2xl">
            En Luba Beats protegemos a los beatmakers, artistas musicales y compradores. A continuación detallamos las reglas de contenido, el sistema sancionatorio de <strong>3 Vidas (Strikes)</strong> y los acuerdos que aceptas al usar la plataforma.
          </p>
        </div>

        {/* Highlight Banner: 3 Strikes System */}
        <div className="mb-10 rounded-3xl border border-red-500/30 bg-gradient-to-b from-red-950/30 to-zinc-950/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40">
              <ShieldAlert className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>El Sistema de las 3 Vidas (3 Strikes)</span>
                <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-300">
                  Regla Clave
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Cada cuenta registrada inicia con 3 vidas para incentivar un ambiente profesional y honesto.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Vida 1 */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Vida 1 / Primer Aviso
                </span>
                <span className="text-lg">❤️</span>
              </div>
              <h3 className="text-sm font-bold text-white">Advertencia Formal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Se detecta una infracción inicial (como subir contenido fuera de lugar o usar samples no acreditados). Se retira el contenido observado y se envía una notificación formal al creador.
              </p>
            </div>

            {/* Vida 2 */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Vida 2 / Último Aviso
                </span>
                <span className="text-lg">💔</span>
              </div>
              <h3 className="text-sm font-bold text-white">Suspensión Temporal</h3>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Reincidencia en infracciones o sospecha fundamentada de fraude. La cuenta es congelada temporalmente y se emite la última oportunidad antes del baneo definitivo.
              </p>
            </div>

            {/* Vida 3 */}
            <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                  Vida 3 / Strike Final
                </span>
                <span className="text-lg">☠️</span>
              </div>
              <h3 className="text-sm font-bold text-white">Eliminación Definitiva</h3>
              <p className="text-xs text-red-200/80 leading-relaxed">
                Al llegar al tercer strike, <strong>la cuenta es eliminada inmediatamente de la base de datos junto con todo su catálogo musical</strong>, tracks y accesos de forma irreversible.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-xs text-zinc-300">
          
          {/* 1. Contenido Estrictamente Musical */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-white">
              <Music2 className="h-5 w-5 text-purple-400" />
              <span>1. Contenido Estrictamente Musical</span>
            </div>
            <p className="leading-relaxed">
              Luba Beats es una plataforma concebida con el único propósito de compartir, reproducir y comercializar <strong>instrumentales (beats), canciones, vocales y obras musicales</strong>.
            </p>
            <div className="rounded-xl border border-red-500/20 bg-black/40 p-3.5 space-y-1.5 text-zinc-300">
              <span className="font-bold text-red-400 block">Está rotundamente prohibido:</span>
              <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
                <li>Subir archivos de audio ajenos a la música (podcasts ajenos, chistes, audios de WhatsApp, memes o ruidos sin composición).</li>
                <li>Subir archivos maliciosos, ejecutables o material que atente contra la seguridad de la plataforma.</li>
                <li>Subir imágenes o portadas con contenido para adultos (NSFW), violencia explícita o difamación.</li>
              </ul>
              <p className="text-[11px] text-red-300/90 pt-1">
                ⚡ Subir material que no sea música resultará en la eliminación inmediata del archivo y la aplicación directa de un <strong>Strike</strong>.
              </p>
            </div>
          </div>

          {/* 2. Propiedad Intelectual & Derechos de Autor */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>2. Propiedad Intelectual & Originalidad Obligatoria</span>
            </div>
            <p className="leading-relaxed">
              Como productor o artista, garantizas que eres el autor legítimo de cada pista que publicas o posees las licencias de uso comercial correspondientes.
            </p>
            <p className="leading-relaxed text-zinc-400">
              Queda estrictamente prohibido descargar un beat de YouTube u otro marketplace y resubirlo a Luba Beats como si fuera propio. El plagio comprobado conlleva la aplicación inmediata de strikes y la potencial remoción de cuenta.
            </p>
          </div>

          {/* 3. Licenciamiento & Contratos */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-white">
              <Lock className="h-5 w-5 text-cyan-400" />
              <span>3. Tipos de Licencias y Validez Legal</span>
            </div>
            <p className="leading-relaxed">
              Las licencias adquiridas a través de Luba Beats (Básica, Premium, Exclusiva) otorgan derechos de uso comercial según las condiciones estipuladas en el contrato digital emitido:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
              <li><strong className="text-zinc-200">Licencia Básica (MP3):</strong> Adecuada para demos, maquetas y transmisiones no comerciales.</li>
              <li><strong className="text-zinc-200">Licencia Premium (WAV + Stems):</strong> Permite distribución en plataformas de streaming con límite de reproducciones acordado.</li>
              <li><strong className="text-zinc-200">Licencia Exclusiva:</strong> Retira el beat del catálogo público y transfiere los derechos exclusivos de masterización al comprador.</li>
            </ul>
          </div>

          {/* 4. Transparencia en Pagos & Seguridad */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-white">
              <DollarSign className="h-5 w-5 text-amber-400" />
              <span>4. Transacciones, Pagos y Fraude Cero</span>
            </div>
            <p className="leading-relaxed">
              Aceptamos pagos a través de <strong>Culqi (tarjetas de crédito/débito y PagoEfectivo CIP), Yape, Plin y Stripe</strong>.
            </p>
            <p className="leading-relaxed text-zinc-400">
              Cualquier intento de estafa, falsificación de comprobantes de pago móviles o reclamos maliciosos tras haber descargado los archivos de audio dará lugar al baneo total de la cuenta y su reporte ante las autoridades financieras pertinentes.
            </p>
          </div>

          {/* 5. Moderación & Super Admin */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-base font-bold text-white">
              <UserX className="h-5 w-5 text-red-400" />
              <span>5. Autoridad de Moderación del Super Admin</span>
            </div>
            <p className="leading-relaxed">
              El equipo de administración de Luba Beats se reserva el derecho de supervisar el catálogo general, suspender cuentas preventivamente, aplicar strikes tras evaluar quejas y eliminar contenido no apto para salvaguardar la reputación y legalidad del ecosistema musical.
            </p>
          </div>

        </div>

        {/* CTA Footer Buttons */}
        <div className="mt-10 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-zinc-900 to-cyan-950/20 p-6 text-center space-y-3">
          <h3 className="text-base font-bold text-white">¿Listo para comenzar a compartir tu música?</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Regístrate ahora, respeta las reglas y conecta con los mejores productores y artistas de la región.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Crear Cuenta en Luba Beats</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition-all"
            >
              <Music2 className="h-4 w-4 text-purple-400" />
              <span>Explorar Beats</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
