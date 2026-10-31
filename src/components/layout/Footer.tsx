import Link from 'next/link';
import { Music2, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 pb-28 pt-16 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-zinc-950">
                  <Music2 className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <span className="text-xl font-black text-white">
                LUBA<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">BEATS</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400">
              La plataforma líder en Latinoamérica para comprar y vender instrumentales, conectar beatmakers con artistas y proteger los derechos de tu música.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Contratos con validez legal internacional</span>
            </div>
          </div>

          {/* Nav Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Explorar Géneros</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link href="#catalogo" className="hover:text-purple-400 transition-colors">Beats de Trap Latino</Link></li>
              <li><Link href="#catalogo" className="hover:text-purple-400 transition-colors">Instrumentales Drill</Link></li>
              <li><Link href="#catalogo" className="hover:text-purple-400 transition-colors">Reggaeton Moderno (Feid / Mora)</Link></li>
              <li><Link href="#catalogo" className="hover:text-purple-400 transition-colors">Boombap Clásico & Lo-Fi</Link></li>
              <li><Link href="#catalogo" className="hover:text-purple-400 transition-colors">R&B Contemporáneo</Link></li>
            </ul>
          </div>

          {/* Productores & Monetización */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Para Productores y Artistas</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link href="/subir" className="hover:text-cyan-400 transition-colors">Subir & Vender Beats</Link></li>
              <li><Link href="/productor/panel" className="hover:text-cyan-400 transition-colors">Panel de Ventas & Gestión</Link></li>
              <li><Link href="/compras" className="hover:text-cyan-400 transition-colors">Mis Beats & Licencias Compradas</Link></li>
              <li><Link href="/#catalogo" className="hover:text-cyan-400 transition-colors">Explorar Catálogo General</Link></li>
            </ul>
          </div>

          {/* Métodos de Pago */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Métodos de Pago Integrados</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Aceptamos pagos en Soles peruanos (PEN) y Dólares (USD):
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-purple-400 border border-purple-500/30">
                Yape
              </span>
              <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-bold text-cyan-400 border border-cyan-500/30">
                Plin
              </span>
              <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 border border-white/10">
                Culqi (Tarjetas)
              </span>
              <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
                Mercado Pago
              </span>
              <span className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                Stripe
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} Luba Beats Beta. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-1">
            <span>Hecho con</span>
            <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
            <span>para la comunidad musical de Perú y el mundo.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
