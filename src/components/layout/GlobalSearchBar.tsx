'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Play,
  Pause,
  Disc3,
  Users,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Beat } from '@/types/beat';
import { useAudioStore } from '@/store/useAudioStore';

interface UserSearchResult {
  id: number;
  nombre_usuario: string;
  tipo: string;
  foto_perfil: string;
  verificado: boolean;
  bio: string;
  beatsCount: number;
  followersCount: number;
}

interface SearchResults {
  beats: Beat[];
  users: UserSearchResult[];
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ beats: [], users: [] });
  const [activeTab, setActiveTab] = useState<'all' | 'beats' | 'users'>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentBeat, isPlaying, playBeat, togglePlay } = useAudioStore();

  // Keyboard shortcut Ctrl+K / Cmd+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ beats: [], users: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.success) {
          setResults({
            beats: data.beats || [],
            users: data.users || [],
          });
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults({ beats: [], users: [] });
    inputRef.current?.focus();
  };

  const handleSelectBeat = (beat: Beat) => {
    setIsOpen(false);
    router.push(`/beat/${beat.id}`);
  };

  const handlePlayToggle = (e: React.MouseEvent, beat: Beat) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentBeat?.id === beat.id) {
      togglePlay();
    } else {
      playBeat(beat);
    }
  };

  const totalResults = results.beats.length + results.users.length;
  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
      {/* Search Input Bar */}
      <div
        className={`group relative flex items-center rounded-2xl border transition-all duration-200 ${
          isOpen
            ? 'border-purple-500/50 bg-zinc-900 shadow-lg shadow-purple-950/20 ring-1 ring-purple-500/30'
            : 'border-white/10 bg-zinc-900/80 hover:border-white/20 hover:bg-zinc-900'
        }`}
      >
        <Search
          className={`ml-3.5 h-4 w-4 shrink-0 transition-colors ${
            isOpen ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar canciones, beats o artistas..."
          className="w-full bg-transparent py-2 pl-2.5 pr-16 text-xs sm:text-sm font-medium text-white placeholder-zinc-500 focus:outline-none"
        />

        {/* Right Action Icons (Clear, Loading, or Ctrl+K shortcut) */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-500 bg-white/5 border border-white/10 select-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Floating Results Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 max-h-[80vh] sm:max-h-[70vh] flex flex-col overflow-hidden">
          {/* Filter Tabs if there are results */}
          {totalResults > 0 && (
            <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-2 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Todos ({totalResults})
              </button>
              {results.beats.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('beats')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl font-bold transition-all ${
                    activeTab === 'beats'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Disc3 className="h-3 w-3" />
                  <span>Pistas ({results.beats.length})</span>
                </button>
              )}
              {results.users.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl font-bold transition-all ${
                    activeTab === 'users'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="h-3 w-3" />
                  <span>Usuarios ({results.users.length})</span>
                </button>
              )}
            </div>
          )}

          {/* Results Scroll Area */}
          <div className="overflow-y-auto space-y-3.5 pr-1 custom-scrollbar flex-1">
            {loading && totalResults === 0 && (
              <div className="py-8 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
                <span>Buscando canciones y creadores...</span>
              </div>
            )}

            {!loading && totalResults === 0 && (
              <div className="py-8 text-center text-zinc-400 flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
                  <Search className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-white">No se encontraron resultados</p>
                <p className="text-[11px] text-zinc-500 max-w-xs">
                  No hay coincidencias para &quot;{query}&quot;. Prueba buscando por género (ej. Trap, Drill) o por artista.
                </p>
              </div>
            )}

            {/* USERS SECTION */}
            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  <Users className="h-3.5 w-3.5" />
                  <span>Artistas y Creadores ({results.users.length})</span>
                </div>
                <div className="mt-1 space-y-1">
                  {results.users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/perfil/${encodeURIComponent(user.nombre_usuario)}`}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-zinc-900 p-0.5 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                          <img
                            src={user.foto_perfil}
                            alt={user.nombre_usuario}
                            className="h-full w-full object-cover rounded-[9px]"
                          />
                        </div>

                        {/* User Metadata */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {user.nombre_usuario}
                            </span>
                            {user.verificado && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 fill-zinc-950" />
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">
                            @{user.nombre_usuario}
                            {user.beatsCount > 0 && ` • ${user.beatsCount} pistas`}
                          </p>
                        </div>
                      </div>

                      {/* Role Pill */}
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                          user.tipo === 'productor'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : user.tipo === 'artista'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {user.tipo}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* BEATS / TRACKS SECTION */}
            {(activeTab === 'all' || activeTab === 'beats') && results.beats.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  <Disc3 className="h-3.5 w-3.5" />
                  <span>Canciones y Beats ({results.beats.length})</span>
                </div>
                <div className="mt-1 space-y-1">
                  {results.beats.map((beat) => {
                    const isCurrent = currentBeat?.id === beat.id;
                    const isCurrentlyPlaying = isCurrent && isPlaying;

                    return (
                      <div
                        key={beat.id}
                        onClick={() => handleSelectBeat(beat)}
                        className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Track Cover with Play Overlay */}
                          <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                            <img
                              src={beat.coverUrl}
                              alt={beat.title}
                              className="h-full w-full object-cover"
                            />
                            {/* Play Button Overlay */}
                            <button
                              type="button"
                              onClick={(e) => handlePlayToggle(e, beat)}
                              className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                                isCurrentlyPlaying
                                  ? 'bg-emerald-950/80 text-emerald-400 opacity-100'
                                  : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-emerald-600'
                              }`}
                            >
                              {isCurrentlyPlaying ? (
                                <Pause className="h-4 w-4 fill-emerald-400" />
                              ) : (
                                <Play className="h-4 w-4 fill-white ml-0.5" />
                              )}
                            </button>
                          </div>

                          {/* Track Info */}
                          <div className="min-w-0">
                            <h4
                              className={`text-xs font-bold truncate transition-colors ${
                                isCurrent
                                  ? 'text-emerald-400'
                                  : 'text-white group-hover:text-emerald-300'
                              }`}
                            >
                              {beat.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate">
                              <span>@{beat.producer.name}</span>
                              <span>•</span>
                              <span className="text-zinc-500 font-mono">{beat.genre}</span>
                              <span>•</span>
                              <span className="text-zinc-500 font-mono">{beat.bpm} BPM</span>
                            </div>
                          </div>
                        </div>

                        {/* Price / Type badge */}
                        <div className="text-right shrink-0 ml-2">
                          {beat.isFree ? (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Música
                            </span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-black text-emerald-400 font-mono">
                                ${beat.priceFrom}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                S/ {beat.priceFromPEN}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Footer: Quick Link to Catalog */}
          <div className="pt-2.5 mt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 px-1 shrink-0">
            <span className="text-[11px] text-zinc-500">Presiona ESC para cerrar</span>
            <Link
              href="/#catalogo"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>Ver todo el catálogo</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
