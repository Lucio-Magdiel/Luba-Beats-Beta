'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  ShoppingBag,
  Menu,
  X,
  Music2,
  Layers,
  UploadCloud,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  LayoutDashboard,
  Mic,
  Shield,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAudioStore } from '@/store/useAudioStore';
import { GlobalSearchBar } from './GlobalSearchBar';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { items, setIsCartOpen } = useCartStore();
  const { activeCategory, setActiveCategory } = useAudioStore();
  const cartCount = items.length;
  const profileUsername = (session?.user as any)?.nombre_usuario || session?.user?.name || 'me';
  const userRole = (session?.user as any)?.role;
  const isComprador = userRole === 'comprador';
  const canUpload = userRole === 'productor' || userRole === 'artista' || userRole === 'super_admin';

  useEffect(() => {
    if (!session?.user) return;
    const fetchUnread = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetch('/api/messages/unread-count')
        .then((r) => r.json())
        .then((d) => {
          if (typeof d.unreadCount === 'number') {
            setUnreadCount(d.unreadCount);
          }
        })
        .catch(() => {});
    };

    fetchUnread();
    const timer = setInterval(fetchUnread, 12000);
    return () => clearInterval(timer);
  }, [session?.user]);

  const handleCategoryClick = (category: 'todo' | 'beat' | 'musica') => {
    setActiveCategory(category);

    if (pathname !== '/') {
      // Si no estamos en la página principal, redirigir a la home con ancla al catálogo
      router.push('/#catalogo');
    } else {
      // Si ya estamos en la home, hacer scroll suave al catálogo
      const catElem = document.getElementById('catalogo');
      if (catElem) {
        catElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090b]/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo - Initial Premium Gradient Design */}
        {/* Brand Logo & Explore Link */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/20 transition-all duration-300 group-hover:shadow-purple-500/40">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-zinc-950 transition-colors group-hover:bg-zinc-900">
                <Music2 className="h-5 w-5 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  LUBA<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">BEATS</span>
                </span>
                <span className="rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/20">
                  Beta
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wide text-zinc-400">
                Marketplace Musical
              </span>
            </div>
          </Link>

          {/* Quick link to catalog */}
          <Link
            href="/#catalogo"
            className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Catálogo</span>
          </Link>
        </div>

        {/* Center Global Search Bar (Spacious and Focused) */}
        <div className="hidden sm:flex flex-1 justify-center max-w-sm md:max-w-md lg:max-w-lg mx-4">
          <GlobalSearchBar />
        </div>

        {/* Right Action Buttons - Minimalist & Harmonious Group */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button (sm:hidden) */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Buscar"
            className="sm:hidden relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/60 text-zinc-400 transition-all hover:border-purple-500/40 hover:bg-zinc-800 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Messages Button (for logged-in users) */}
          {session?.user && (
            <Link
              href="/mensajes"
              aria-label="Bandeja de Mensajes"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/60 text-zinc-400 transition-all hover:border-purple-500/40 hover:bg-zinc-800 hover:text-white"
            >
              <MessageSquare className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-500 px-1 text-[9px] font-black text-white shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir Carrito"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/60 text-zinc-400 transition-all hover:border-emerald-500/40 hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-black text-zinc-950 shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Subtle Vertical Divider */}
          <div className="hidden sm:block h-5 w-px bg-white/10 mx-1" />

          {/* CTA: Subir Pista (for creators) */}
          {canUpload && (
            <Link
              href="/subir"
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-zinc-950 px-3 py-1.5 text-xs font-bold text-emerald-400 transition-all shadow-sm"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Subir</span>
            </Link>
          )}

          {/* User Auth Section */}
          {status === 'loading' ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-white/5" />
          ) : session?.user ? (
            <div className="relative">
              {/* Minimalist Profile Pill */}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 hover:bg-zinc-800/80 hover:border-white/20 py-1.5 pl-1.5 pr-2.5 text-xs font-semibold text-zinc-200 transition-all cursor-pointer shadow-sm"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'Usuario'}
                    className="h-7 w-7 rounded-lg object-cover ring-1 ring-purple-500/40"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                    {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="max-w-[105px] truncate font-medium text-white text-xs">
                  {session.user.name || session.user.email?.split('@')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-zinc-950/95 p-2 backdrop-blur-2xl shadow-2xl shadow-purple-950/40 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="border-b border-white/10 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white truncate">
                        {session.user.name || 'Usuario Luba'}
                      </p>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        userRole === 'productor'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : userRole === 'artista'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {userRole || 'comprador'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {session.user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    {/* Panel de Productor */}
                    {((session.user as any).role === 'productor' ||
                      (session.user as any).role === 'super_admin') && (
                      <Link
                        href="/productor/panel"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Panel de Productor</span>
                      </Link>
                    )}

                    {/* Panel de Artista */}
                    {((session.user as any).role === 'artista' ||
                      (session.user as any).role === 'super_admin') && (
                      <Link
                        href="/artista/panel"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors"
                      >
                        <Mic className="h-4 w-4" />
                        <span>Panel de Artista</span>
                      </Link>
                    )}

                    {/* Panel de Super Admin */}
                    {(session.user as any).role === 'super_admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Panel de Super Admin</span>
                      </Link>
                    )}

                    <Link
                      href="/compras"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-white/5 transition-colors"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Mis Beats & Licencias</span>
                    </Link>

                    {canUpload && (
                      <Link
                        href="/subir"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/5 transition-colors"
                      >
                        <UploadCloud className="h-4 w-4 text-purple-400" />
                        <span>Subir Beat / Música</span>
                      </Link>
                    )}

                    <Link
                      href="/mensajes"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                        <span>Mis Mensajes</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-purple-500 px-1 text-[9px] font-black text-white">
                          {unreadCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      href={`/perfil/${profileUsername}`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors"
                    >
                      <User className="h-4 w-4 text-zinc-400" />
                      <span>Mi Perfil Público</span>
                    </Link>
                  </div>

                  <div className="border-t border-white/5 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/90 px-3.5 py-2 text-xs font-bold text-zinc-300 hover:border-white/25 hover:bg-zinc-800 hover:text-white transition-all shadow-sm"
              >
                <LogIn className="h-3.5 w-3.5 text-zinc-400" />
                <span>Entrar</span>
              </Link>
              <Link
                href="/registro"
                className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                <span>Registro</span>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-400 md:hidden hover:text-white"
            aria-label="Menú móvil"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Expandable Drawer */}
      {mobileSearchOpen && (
        <div className="sm:hidden border-t border-white/10 bg-zinc-950 px-4 py-3 animate-in slide-in-from-top-2 duration-150">
          <GlobalSearchBar />
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-zinc-950 px-4 py-4 md:hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {/* Search in mobile drawer */}
            <div className="mb-2">
              <GlobalSearchBar />
            </div>

            <div className="flex items-center rounded-xl bg-zinc-900 p-1 mb-2">
              <button
                onClick={() => {
                  handleCategoryClick('todo');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg text-center ${
                  activeCategory === 'todo' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'
                }`}
              >
                Todo
              </button>
              <button
                onClick={() => {
                  handleCategoryClick('beat');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg text-center ${
                  activeCategory === 'beat' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'
                }`}
              >
                Beats
              </button>
              <button
                onClick={() => {
                  handleCategoryClick('musica');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg text-center ${
                  activeCategory === 'musica' ? 'bg-purple-600 text-white' : 'text-zinc-400'
                }`}
              >
                Música
              </button>
            </div>

            <Link
              href="#catalogo"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
            >
              Explorar Catálogo
            </Link>
            {!isComprador && (
              <Link
                href="/subir"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                Subir Beat / Música
              </Link>
            )}

            {/* Mobile Auth */}
            <div className="border-t border-white/10 pt-2 mt-1">
              {session?.user ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-xs text-zinc-400">
                    Conectado como <span className="font-bold text-white">{session.user.name || session.user.email}</span>
                  </div>

                  {/* Panel de Productor */}
                  {((session.user as any).role === 'productor' ||
                    (session.user as any).role === 'super_admin') && (
                    <Link
                      href="/productor/panel"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Panel de Productor
                    </Link>
                  )}

                  {/* Panel de Artista */}
                  {((session.user as any).role === 'artista' ||
                    (session.user as any).role === 'super_admin') && (
                    <Link
                      href="/artista/panel"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-purple-400 hover:bg-purple-500/10"
                    >
                      Panel de Artista
                    </Link>
                  )}

                  {/* Panel de Super Admin */}
                  {(session.user as any).role === 'super_admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-semibold text-amber-400 hover:bg-amber-500/10"
                    >
                      Panel de Super Admin
                    </Link>
                  )}

                  <Link
                    href="/compras"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10"
                  >
                    Mis Beats & Licencias
                  </Link>

                  <Link
                    href="/mensajes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
                  >
                    <span>Mis Mensajes</span>
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-purple-500 px-1 text-[10px] font-black text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={`/perfil/${profileUsername}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900"
                  >
                    Mi Perfil Público
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-sm font-bold text-white"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl bg-purple-600 text-sm font-bold text-white shadow-md shadow-purple-600/30"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
