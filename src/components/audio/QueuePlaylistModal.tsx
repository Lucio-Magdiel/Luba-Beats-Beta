'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronDown,
  ListMusic,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Trash2,
  ChevronUp,
  Heart,
  ShoppingCart,
  Download,
  CheckCircle2,
  Music,
  Sparkles,
  Disc3,
  Layers,
  Headphones,
} from 'lucide-react';
import { formatPlays } from '@/lib/formatPlays';
import { useAudioStore } from '@/store/useAudioStore';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { WaveformVisualizer } from './WaveformVisualizer';

export const QueuePlaylistModal: React.FC = () => {
  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    queue,
    repeatMode,
    isQueueOpen,
    setIsQueueOpen,
    togglePlay,
    seek,
    nextBeat,
    prevBeat,
    toggleRepeat,
    shuffleQueue,
    clearQueue,
    removeFromQueue,
    moveQueueItem,
    playFromQueue,
    playBeat,
  } = useAudioStore();

  const { openLicenseModal } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  // Mobile tab view: 'queue' (A continuación) or 'player' (Reproductor)
  const [mobileTab, setMobileTab] = useState<'queue' | 'player'>('queue');
  const [isLoadingLiked, setIsLoadingLiked] = useState(false);

  const handleLoadLikedSongs = async () => {
    try {
      setIsLoadingLiked(true);
      const res = await fetch('/api/playlists/liked');
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Inicia sesión para escuchar tus canciones que te gustan');
        return;
      }
      if (!data.playlist?.beats || data.playlist.beats.length === 0) {
        alert('Aún no tienes canciones en tu playlist de favoritos. Dale me gusta ❤️ a algunas pistas para verlas aquí.');
        return;
      }
      // Reproducir primera pista y reemplazar la cola con la playlist
      playBeat(data.playlist.beats[0], data.playlist.beats);
    } catch (err) {
      console.error('Error al cargar playlist de canciones que te gustan:', err);
    } finally {
      setIsLoadingLiked(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isQueueOpen) {
        setIsQueueOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQueueOpen, setIsQueueOpen]);

  if (!isQueueOpen || !currentBeat) return null;

  const isLiked = isFavorite(currentBeat.id);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekPercent = (percent: number) => {
    const targetSeconds = percent * (duration || currentBeat.duration);
    seek(targetSeconds);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">

      {/* Outer Click to Dismiss (on top strip) */}
      <div
        className="hidden md:block absolute inset-0 -z-10"
        onClick={() => setIsQueueOpen(false)}
      />

      {/* Main YouTube Music Full Player / Queue Container */}
      <div className="relative flex h-[94vh] md:h-[92vh] w-full max-w-7xl mx-auto flex-col overflow-hidden rounded-t-[32px] md:rounded-t-[36px] border border-white/10 bg-gradient-to-b from-zinc-900/98 via-zinc-950 to-black shadow-2xl backdrop-blur-3xl animate-in slide-in-from-bottom-8 duration-300">

        {/* Glow ambient effects */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="pointer-events-none absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-cyan-500/15 blur-[120px]" />

        {/* Top Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQueueOpen(false)}
              className="group flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Minimizar reproductor (Esc)"
              aria-label="Cerrar vista de playlist"
            >
              <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
            </button>

            <div className="flex items-center gap-2">
              <ListMusic className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Lista de Reproducción Estilo YouTube Music
              </span>
              <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
                {queue.length} {queue.length === 1 ? 'canción' : 'canciones'}
              </span>
            </div>
          </div>

          {/* Mobile Switch Tabs */}
          <div className="flex md:hidden items-center rounded-xl border border-white/10 bg-zinc-900 p-0.5">
            <button
              onClick={() => setMobileTab('queue')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${mobileTab === 'queue' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
            >
              A continuación ({queue.length})
            </button>
            <button
              onClick={() => setMobileTab('player')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${mobileTab === 'player' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
            >
              Reproductor
            </button>
          </div>

          {/* Quick Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={shuffleQueue}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
              title="Mezclar canciones de la lista"
            >
              <Shuffle className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden sm:inline">Aleatorio</span>
            </button>

            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/40 transition-colors"
                title="Limpiar cola y dejar solo la actual"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                <span className="hidden sm:inline">Limpiar cola</span>
              </button>
            )}

            <button
              onClick={() => setIsQueueOpen(false)}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">

            {/* ============================================================== */}
            {/* LEFT COLUMN: Currently Playing Track & Big Controls            */}
            {/* ============================================================== */}
            <div
              className={`h-full flex-col justify-between overflow-y-auto p-6 md:p-8 md:col-span-5 lg:col-span-5 ${mobileTab === 'player' ? 'flex' : 'hidden md:flex'
                }`}
            >
              {/* Top: Album Art & Visualizer aura */}
              <div className="flex flex-col items-center text-center">
                <div className="relative group my-auto">
                  {/* Glowing halo behind cover */}
                  <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 opacity-60 blur-xl transition-all duration-700 ${isPlaying ? 'opacity-80 scale-105' : 'opacity-30'}`} />

                  <div className="relative h-64 w-64 sm:h-72 sm:w-72 lg:h-80 lg:w-80 overflow-hidden rounded-3xl border border-white/15 bg-zinc-950 shadow-2xl">
                    <img
                      src={currentBeat.coverUrl}
                      alt={currentBeat.title}
                      className={`h-full w-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'
                        }`}
                    />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-purple-600/10 mix-blend-overlay animate-pulse" />
                    )}

                    {/* Vinyl spinning badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
                      <Disc3 className={`h-3.5 w-3.5 text-purple-400 ${isPlaying ? 'animate-spin' : ''}`} />
                      <span>{currentBeat.bpm} BPM</span>
                    </div>
                  </div>
                </div>

                {/* Track Title, Producer & Badges */}
                <div className="mt-6 w-full max-w-sm">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-wide">
                      {currentBeat.title}
                    </h2>
                    <button
                      onClick={() => toggleFavorite(currentBeat.id)}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-white/5 hover:bg-pink-500/10 text-zinc-400 hover:text-pink-500 transition-all border border-white/5 hover:border-pink-500/20 active:scale-95"
                      title={isLiked ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                    >
                      <Heart
                        className={`h-4 w-4 transition-transform ${isLiked ? 'fill-pink-500 text-pink-500 scale-110' : ''
                          }`}
                      />
                      <span className={`text-xs font-mono font-bold ${isLiked ? 'text-pink-400' : 'text-zinc-400'}`}>
                        {currentBeat.likes || 0}
                      </span>
                    </button>
                  </div>

                  <div className="mt-1 flex items-center justify-center gap-2 text-sm text-zinc-400">
                    <span className="font-semibold text-zinc-300">{currentBeat.producer.name}</span>
                    {currentBeat.producer.verified && (
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    )}
                    <span>•</span>
                    <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/25">
                      {currentBeat.genre}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-xs text-zinc-400">{currentBeat.key}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-xs text-purple-300" title={`${currentBeat.plays.toLocaleString()} vistas / reproducciones`}>
                      <Headphones className="h-3.5 w-3.5 text-purple-400" />
                      <span>{formatPlays(currentBeat.plays)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle: Waveform & Time */}
              <div className="my-4 w-full">
                <WaveformVisualizer
                  waveform={currentBeat.waveform}
                  currentTime={currentTime}
                  duration={duration || currentBeat.duration}
                  isPlaying={isPlaying}
                  onSeek={handleSeekPercent}
                  height={44}
                />
                <div className="mt-1.5 flex justify-between font-mono text-xs text-zinc-400 px-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || currentBeat.duration)}</span>
                </div>
              </div>

              {/* Bottom: Playback Controls & Action */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center gap-6">
                  {/* Shuffle Button */}
                  <button
                    onClick={shuffleQueue}
                    className="p-2 text-zinc-400 hover:text-purple-400 transition-colors"
                    title="Mezclar aleatorio"
                  >
                    <Shuffle className="h-5 w-5" />
                  </button>

                  {/* Previous */}
                  <button
                    onClick={prevBeat}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                    title="Anterior"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>

                  {/* Play / Pause Primary */}
                  <button
                    onClick={togglePlay}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 text-white shadow-2xl shadow-purple-600/50 hover:scale-105 active:scale-95 transition-transform"
                    title={isPlaying ? 'Pausar' : 'Reproducir'}
                  >
                    {isPlaying ? (
                      <Pause className="h-7 w-7 fill-white" />
                    ) : (
                      <Play className="h-7 w-7 fill-white ml-1" />
                    )}
                  </button>

                  {/* Next */}
                  <button
                    onClick={nextBeat}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                    title="Siguiente"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>

                  {/* Repeat Mode */}
                  <button
                    onClick={toggleRepeat}
                    className={`relative p-2 rounded-xl transition-all ${repeatMode !== 'off'
                        ? 'text-purple-300 bg-purple-500/20 border border-purple-500/40 shadow-lg shadow-purple-500/20'
                        : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    title={
                      repeatMode === 'one'
                        ? 'Repitiendo canción actual'
                        : repeatMode === 'all'
                          ? 'Repitiendo lista completa'
                          : 'Bucle desactivado'
                    }
                  >
                    {repeatMode === 'one' ? (
                      <Repeat1 className="h-5 w-5" />
                    ) : (
                      <Repeat className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Buy License or Download CTA */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  {currentBeat.type === 'beat' && !currentBeat.isFree && currentBeat.priceFrom > 0 ? (
                    <button
                      onClick={() => openLicenseModal(currentBeat)}
                      className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 px-6 py-3 text-sm font-extrabold text-white shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Comprar Licencia desde</span>
                      <span className="rounded-lg bg-black/30 px-2 py-0.5 font-mono text-xs text-purple-200">
                        ${currentBeat.priceFrom}
                      </span>
                    </button>
                  ) : (
                    <a
                      href={currentBeat.audioPreviewUrl}
                      download={`${currentBeat.title}.mp3`}
                      className="flex items-center gap-2 rounded-2xl bg-purple-600/20 border border-purple-500/40 px-6 py-3 text-sm font-bold text-purple-200 hover:bg-purple-600 hover:text-white transition-all shadow-md"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar Audio Master</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* RIGHT COLUMN: Queue / Playlist (A continuación)               */}
            {/* ============================================================== */}
            <div
              className={`h-full flex-col overflow-hidden md:col-span-7 lg:col-span-7 ${mobileTab === 'queue' ? 'flex' : 'hidden md:flex'
                }`}
            >
              {/* Queue Subheader */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 bg-zinc-950/60 px-4 sm:px-5 py-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-zinc-300">
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span>A continuación</span>
                  <span className="text-[11px] text-zinc-500 hidden lg:inline">
                    (Usa las flechas para ordenar)
                  </span>
                </div>
                
                <button
                  onClick={handleLoadLikedSongs}
                  disabled={isLoadingLiked}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 hover:border-pink-500/50 transition-all active:scale-95 disabled:opacity-50"
                  title="Cargar y escuchar tu playlist automática de canciones favoritas"
                >
                  <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
                  <span>{isLoadingLiked ? 'Cargando...' : 'Canciones que te gustan'}</span>
                </button>
              </div>

              {/* Playlist Tracks Scrollable List */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2">
                {queue.map((beat, idx) => {
                  const isCurrent = beat.id === currentBeat.id;

                  return (
                    <div
                      key={`${beat.id}-${idx}`}
                      className={`group relative flex items-center justify-between gap-3 rounded-2xl border p-2.5 sm:p-3 transition-all ${isCurrent
                          ? 'border-purple-500/50 bg-gradient-to-r from-purple-950/40 to-zinc-900/80 shadow-lg shadow-purple-900/20'
                          : 'border-white/5 bg-zinc-950/50 hover:border-white/20 hover:bg-zinc-900/60'
                        }`}
                    >
                      {/* Left: Reorder Arrows & Number */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Up / Down Reorder buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveQueueItem(idx, 'up');
                            }}
                            className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Subir en la lista"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <button
                            disabled={idx === queue.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveQueueItem(idx, 'down');
                            }}
                            className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Bajar en la lista"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Track Index or Sound Wave when active */}
                        <div className="flex h-7 w-7 items-center justify-center font-mono text-xs font-bold text-zinc-500">
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3.5">
                              <span className="w-1 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s] h-full" />
                              <span className="w-1 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.15s] h-3/4" />
                              <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-1/2" />
                            </div>
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Artwork + Title + Producer (Click to play) */}
                      <div
                        onClick={() => playFromQueue(idx)}
                        className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-md">
                          <img
                            src={beat.coverUrl}
                            alt={beat.title}
                            className="h-full w-full object-cover"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                              {isPlaying ? (
                                <Pause className="h-4 w-4 fill-white text-white" />
                              ) : (
                                <Play className="h-4 w-4 fill-white text-white ml-0.5" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`truncate text-xs sm:text-sm font-bold ${isCurrent ? 'text-purple-300' : 'text-white'
                                }`}
                            >
                              {beat.title}
                            </span>
                            {isCurrent && (
                              <span className="shrink-0 rounded-full bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-bold text-purple-300 border border-purple-500/30">
                                Reproduciendo
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <span className="truncate">{beat.producer.name}</span>
                            {beat.producer.verified && (
                              <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0" />
                            )}
                            <span>•</span>
                            <span className="font-mono text-[11px] text-zinc-500">
                              {formatTime(beat.duration)}
                            </span>
                            <span>•</span>
                            <span
                              className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400"
                              title={`${beat.plays.toLocaleString()} vistas / reproducciones`}
                            >
                              <Headphones className="h-2.5 w-2.5 text-zinc-500" />
                              <span>{formatPlays(beat.plays)}</span>
                            </span>
                            <span>•</span>
                            <span
                              className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400"
                              title={`${beat.likes || 0} me gusta`}
                            >
                              <Heart className="h-2.5 w-2.5 text-pink-500/80 fill-pink-500/30" />
                              <span>{beat.likes || 0}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (Play, License, Remove) */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {beat.type === 'beat' && !beat.isFree && beat.priceFrom > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openLicenseModal(beat);
                            }}
                            className="hidden sm:flex items-center gap-1 rounded-lg bg-zinc-900 border border-white/10 px-2 py-1 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Comprar Licencia"
                          >
                            <ShoppingCart className="h-3 w-3 text-purple-400" />
                            <span className="font-mono text-[11px]">${beat.priceFrom}</span>
                          </button>
                        )}

                        {/* Remove from queue */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(beat.id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-950/40 hover:text-red-400 transition-colors"
                          title="Quitar de la lista de reproducción"
                          aria-label="Quitar de la cola"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {queue.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                    <Music className="h-12 w-12 text-zinc-700 mb-2" />
                    <p className="text-sm font-semibold">No hay canciones en la lista.</p>
                    <p className="text-xs text-zinc-600">Explora el catálogo y dale play a cualquier beat.</p>
                  </div>
                )}
              </div>

              {/* Queue Bottom Hint & Stats */}
              <div className="border-t border-white/5 bg-zinc-950/70 px-5 py-3 text-xs text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  Total en cola: {queue.length}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

