'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Sparkles,
  Zap,
  Music,
  ShieldCheck,
  Smartphone,
  Sliders,
  Disc3,
  Music2,
  ArrowRight,
  Flame,
  Users,
  CheckCircle2,
  UploadCloud
} from 'lucide-react';
import { Beat, FilterState } from '@/types/beat';
import { HarmonicFilter } from '@/components/beats/HarmonicFilter';
import { BeatCard } from '@/components/beats/BeatCard';
import { BeatRow } from '@/components/beats/BeatRow';
import { useAudioStore } from '@/store/useAudioStore';

interface CreatorItem {
  id: number;
  nombre_usuario: string;
  tipo: string;
  foto_perfil: string | null;
  banner: string | null;
  bio: string | null;
  verificado_google: boolean;
  fecha_registro: string | null;
  beatsCount: number;
  followersCount: number;
  isNew: boolean;
  hasRecentUpload: boolean;
  latestBeatTitle: string | null;
  latestUploadDate: string | null;
}

export default function HomePage() {
  const { playBeat, activeCategory, setActiveCategory, uploadedBeats } = useAudioStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    genre: 'Todos',
    bpmRange: [60, 180],
    key: 'Cualquier Tonalidad',
    mood: 'Todos',
    categoryTab: activeCategory,
    sortBy: 'trending'
  });

  const [dbBeats, setDbBeats] = useState<Beat[]>([]);
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  // Fetch real beats from Supabase PostgreSQL on mount
  useEffect(() => {
    fetch('/api/beats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.beats)) {
          setDbBeats(data.beats);
        }
      })
      .catch((err) => console.warn('Could not load DB beats:', err));
  }, []);

  // Fetch dynamic creators from API
  useEffect(() => {
    fetch('/api/creators')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.creators)) {
          setCreators(data.creators);
        }
      })
      .catch((err) => console.warn('Could not load creators:', err))
      .finally(() => setLoadingCreators(false));
  }, []);

  // Auto-scroll al catálogo si se llega con hash #catalogo desde otra vista
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#catalogo') {
      const timer = setTimeout(() => {
        const elem = document.getElementById('catalogo');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleFilterChange = (newFilter: FilterState) => {
    setFilter(newFilter);
    if (newFilter.categoryTab !== activeCategory) {
      setActiveCategory(newFilter.categoryTab);
    }
  };

  const activeFilter = useMemo(
    () => ({
      ...filter,
      categoryTab: activeCategory,
    }),
    [filter, activeCategory]
  );

  const allBeats = useMemo(() => {
    const ids = new Set<string>();
    const result: Beat[] = [];
    for (const b of [...uploadedBeats, ...dbBeats]) {
      if (!ids.has(b.id)) {
        ids.add(b.id);
        result.push(b);
      }
    }
    return result;
  }, [uploadedBeats, dbBeats]);

  // Filter and sort logic
  const filteredBeats = useMemo(() => {
    return allBeats.filter((item) => {
      // Category filter (if not 'todo')
      if (activeFilter.categoryTab !== 'todo' && item.type !== activeFilter.categoryTab) {
        return false;
      }

      // Search text
      if (activeFilter.search) {
        const query = activeFilter.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesProducer = item.producer.name.toLowerCase().includes(query);
        const matchesTag = item.tags.some((t: string) => t.toLowerCase().includes(query));
        const matchesGenre = item.genre.toLowerCase().includes(query);
        if (!matchesTitle && !matchesProducer && !matchesTag && !matchesGenre) {
          return false;
        }
      }

      // Genre
      if (activeFilter.genre && activeFilter.genre !== 'Todos' && item.genre !== activeFilter.genre) {
        return false;
      }

      // BPM Range
      if (item.bpm < activeFilter.bpmRange[0] || item.bpm > activeFilter.bpmRange[1]) {
        return false;
      }

      // Key
      if (activeFilter.key && activeFilter.key !== 'Cualquier Tonalidad' && item.key !== activeFilter.key) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (activeFilter.sortBy === 'popular') return b.plays - a.plays;
      if (activeFilter.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (activeFilter.sortBy === 'price_low') return a.priceFrom - b.priceFrom;
      if (activeFilter.sortBy === 'price_high') return b.priceFrom - a.priceFrom;
      return b.likes - a.likes; // default trending
    });
  }, [allBeats, activeFilter]);

  // Separate collections for the 'Todo' split view
  const beatsList = useMemo(
    () => filteredBeats.filter((b) => b.type === 'beat'),
    [filteredBeats]
  );
  const musicList = useMemo(
    () => filteredBeats.filter((b) => b.type === 'musica'),
    [filteredBeats]
  );

  return (
    <div className="relative overflow-hidden">
      
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[650px] w-full max-w-7xl">
        <div className="absolute top-[-140px] left-1/4 h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-[140px]" />
        <div className="absolute top-[-60px] right-1/4 h-[380px] w-[380px] rounded-full bg-purple-600/20 blur-[140px]" />
      </div>

      {/* HERO SECTION */}
      <section className="relative px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 text-center max-w-5xl mx-auto">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-500/10 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>La plataforma #1 de Beats y Música Independiente en Perú</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-300 font-bold">Yape & Plin Directo</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] sm:leading-[1.08]">
          El Ecosistema para Beatmakers <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400">
            y Artistas Musicales
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          Explora instrumentales para tu próximo hit con <strong className="text-zinc-200">BPM exacto</strong> y <strong className="text-zinc-200">tonalidad armónica</strong>, o descubre y reproduce canciones completas de artistas independientes sin interrupciones.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              handleFilterChange({ ...filter, categoryTab: 'beat' });
              const elem = document.getElementById('catalogo');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-black text-zinc-950 shadow-xl shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-400 transition-all hover:scale-105 active:scale-95"
          >
            <Disc3 className="h-4 w-4 fill-zinc-950" />
            <span>Explorar Beats</span>
          </button>

          <button
            onClick={() => {
              handleFilterChange({ ...filter, categoryTab: 'musica' });
              const elem = document.getElementById('catalogo');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-black text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95"
          >
            <Music2 className="h-4 w-4" />
            <span>Escuchar Música Libre</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left border-y border-white/10 py-5 sm:py-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Yape & Plin</h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate">Cobros instantáneos</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Filtro Armónico</h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate">BPM y Escalas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">Licencias Legales</h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate">Contratos PDF</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-1">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">WAV & Stems</h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate">Audio 24-bit</p>
            </div>
          </div>
        </div>

      </section>

      {/* CATALOG & HARMONIC FILTER SECTION */}
      <section id="catalogo" className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Header of Catalogue */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Flame className="h-4 w-4" />
              <span>Explorador Inteligente</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Catálogo de Beats & Música
            </h2>
          </div>

          {/* Quick Play All Button */}
          <button
            onClick={() => {
              if (filteredBeats.length > 0) {
                playBeat(filteredBeats[0], filteredBeats);
              }
            }}
            className="flex items-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600 hover:text-zinc-950 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Reproducir Selección ({filteredBeats.length})</span>
          </button>
        </div>

        {/* Filter component */}
        <HarmonicFilter
          filter={activeFilter}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalResults={filteredBeats.length}
        />

        {/* CATALOG OUTPUT */}
        <div className="mt-10">
          {filteredBeats.length === 0 ? (
            <div className="rounded-3xl border border-white/5 bg-zinc-950/60 p-12 sm:p-16 text-center text-zinc-400">
              <Music className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
              <h3 className="text-lg font-bold text-white">No hay pistas en el catálogo aún</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                El catálogo está listo para recibir nuevos lanzamientos. Sé el primer creador en publicar tu música o instrumental.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/subir"
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Subir Mi Primera Pista</span>
                </Link>
              </div>
            </div>
          ) : viewMode === 'list' ? (
            // LIST VIEW: Unified list with category badges
            <div className="space-y-2">
              {filteredBeats.map((item, idx) => (
                <BeatRow key={item.id} beat={item} index={idx} />
              ))}
            </div>
          ) : activeFilter.categoryTab === 'todo' ? (
            // GRID VIEW - SPLIT SECTIONS (BEATS vs MÚSICA - Iconic from v1)
            <div className="space-y-14">
              
              {/* SECTION 1: 🟢 BEATS */}
              {beatsList.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md">
                        <Disc3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                          Beats <span className="text-xs font-semibold text-zinc-400">({beatsList.length} instrumentales)</span>
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFilterChange({ ...filter, categoryTab: 'beat' })}
                      className="group flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span>Ver todos</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {beatsList.map((beat) => (
                      <BeatCard key={beat.id} beat={beat} />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: 🟣 MÚSICA */}
              {musicList.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-md">
                        <Music2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-2">
                          Música <span className="text-xs font-semibold text-zinc-400">({musicList.length} canciones)</span>
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFilterChange({ ...filter, categoryTab: 'musica' })}
                      className="group flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <span>Ver todas</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {musicList.map((song) => (
                      <BeatCard key={song.id} beat={song} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            // GRID VIEW - SINGLE FILTERED CATEGORY
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBeats.map((item) => (
                <BeatCard key={item.id} beat={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TOP PRODUCERS & DYNAMIC CREATORS SECTION */}
      <section id="productores" className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Comunidad de Creadores
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Productores & Artistas Destacados
          </h2>
          <p className="text-xs text-zinc-400 mt-2">
            Descubre a los creadores de la comunidad, nuevos miembros de los últimos 2 días y perfiles con lanzamientos recientes.
          </p>
        </div>

        {loadingCreators ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-52 rounded-2xl border border-white/5 bg-zinc-900/40 animate-pulse" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-zinc-950/60 p-10 text-center max-w-md mx-auto space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white">Sé el primer creador en unirte</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Crea tu cuenta de productor o artista para aparecer aquí y dar a conocer tu música a toda la comunidad.
            </p>
            <div className="pt-2">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95"
              >
                <span>Crear Cuenta de Creador</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {creators.map((c) => {
              const isProd = c.tipo === 'productor';
              const isArt = c.tipo === 'artista';
              const avatar =
                c.foto_perfil ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';

              return (
                <Link
                  key={c.id}
                  href={`/perfil/${encodeURIComponent(c.nombre_usuario)}`}
                  className={`group relative rounded-2xl border bg-zinc-950/70 p-5 text-center transition-all duration-300 hover:-translate-y-1 block shadow-lg ${
                    isProd
                      ? 'border-emerald-500/20 hover:border-emerald-400/70 hover:shadow-emerald-950/30'
                      : 'border-purple-500/20 hover:border-purple-400/70 hover:shadow-purple-950/30'
                  }`}
                >
                  {/* Status Badge (New Creator <= 2 days or Recent Upload) */}
                  {c.isNew ? (
                    <span className="absolute top-3 right-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-black text-emerald-300 shadow-sm animate-pulse">
                      ✨ Nuevo Creador
                    </span>
                  ) : c.hasRecentUpload ? (
                    <span className="absolute top-3 right-3 rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[9px] font-black text-cyan-300 shadow-sm">
                      🔥 Nueva Pista
                    </span>
                  ) : null}

                  {/* Avatar with Glow Ring */}
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full p-1 shadow-lg">
                    <div
                      className={`h-full w-full rounded-full p-[2px] transition-transform duration-300 group-hover:scale-105 ${
                        isProd
                          ? 'bg-gradient-to-tr from-emerald-500 to-cyan-400'
                          : 'bg-gradient-to-tr from-purple-500 to-pink-500'
                      }`}
                    >
                      <img
                        src={avatar}
                        alt={c.nombre_usuario}
                        className="h-full w-full rounded-full object-cover bg-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Username with verification */}
                  <h3 className="mt-4 text-base font-bold text-white flex items-center justify-center gap-1.5 group-hover:text-emerald-400 transition-colors">
                    <span className="truncate">{c.nombre_usuario}</span>
                    {c.verificado_google && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    )}
                  </h3>

                  {/* Role */}
                  <p
                    className={`text-xs font-semibold mt-0.5 ${
                      isProd ? 'text-emerald-400' : isArt ? 'text-purple-400' : 'text-zinc-400'
                    }`}
                  >
                    {isProd ? 'Productor Musical' : isArt ? 'Artista Musical' : 'Creador Luba'}
                  </p>

                  {/* Stats / Info */}
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {c.beatsCount > 0
                      ? `${c.beatsCount} ${c.beatsCount === 1 ? 'Pista' : 'Pistas'} • Perú`
                      : 'Perfil Creado • Perú'}
                  </p>

                  {/* Hover action prompt */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-1 text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                    <span>Ver Perfil Público</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA SECTION: VENDER / SUBIR */}
      <section id="vender" className="px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/40 p-8 sm:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              ¿Eres Beatmaker o Artista?
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white">
              Sube tus Pistas y Canciones a Luba Beats Beta
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Monetiza tus instrumentales con licencias protegidas o da a conocer tus canciones a miles de oyentes en Latinoamérica. Recibe tus ganancias directamente a tu cuenta o Yape.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/subir"
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-xs font-black text-zinc-950 shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95"
              >
                <span>Comenzar a Subir</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
