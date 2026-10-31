'use client';

import { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Heart,
  ShoppingCart,
  CheckCircle2,
  Download,
  ListMusic,
  ChevronUp,
} from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { WaveformVisualizer } from './WaveformVisualizer';
import { QueuePlaylistModal } from './QueuePlaylistModal';

export const PersistentPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentBeat,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    repeatMode,
    seekTarget,
    isQueueOpen,
    setIsQueueOpen,
    toggleQueueOpen,
    initCatalog,
    togglePlay,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    nextBeat,
    prevBeat,
    toggleRepeat,
    clearSeekTarget,
    seek
  } = useAudioStore();

  const { openLicenseModal } = useCartStore();
  const { isFavorite, toggleFavorite, initFavorites } = useFavoritesStore();

  const isLiked = currentBeat ? isFavorite(currentBeat.id) : false;

  // Initialize catalog and favorites in the background
  useEffect(() => {
    initCatalog();
    initFavorites();
  }, [initCatalog, initFavorites]);

  // Sync play/pause with HTML5 Audio element
  useEffect(() => {
    if (!audioRef.current || !currentBeat) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Audio play auto-policy warning:', error);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentBeat]);

  // Handle seekTarget changes & resume playback if isPlaying
  useEffect(() => {
    if (seekTarget !== null && audioRef.current) {
      audioRef.current.currentTime = seekTarget;
      clearSeekTarget();
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn('Audio seek play warning:', err);
        });
      }
    }
  }, [seekTarget, clearSeekTarget, isPlaying]);

  // Handle volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  if (!currentBeat) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  };

  const handleSeekPercent = (percent: number) => {
    const targetSeconds = percent * (duration || currentBeat.duration);
    seek(targetSeconds);
  };

  const progressPercent =
    (duration || currentBeat.duration) > 0
      ? Math.min(100, (currentTime / (duration || currentBeat.duration)) * 100)
      : 0;

  return (
    <>
      {/* YouTube Music Style Playlist & Queue Full View Drawer / Modal */}
      <QueuePlaylistModal />

      <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-4 animate-in slide-in-from-bottom duration-300">
        {/* Hidden Audio Element with robust onEnded loop & next handler */}
        <audio
          ref={audioRef}
          src={currentBeat.audioPreviewUrl}
          autoPlay={isPlaying}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration || currentBeat.duration);
            }
          }}
          onEnded={() => {
            // Si repite una sola pista o repite-todo con 1 sola canción en cola
            if (repeatMode === 'one' || (repeatMode === 'all' && queue.length <= 1)) {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch((err) => console.warn('Repeat play warning:', err));
                setCurrentTime(0);
              }
            } else {
              nextBeat();
            }
          }}
        />

        {/* Player Container */}
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-2.5 sm:p-3 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-purple-500/30">
          
          {/* MOBILE SLIM SCRUBBER (Touch/Click to Seek) */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              handleSeekPercent(percent);
            }}
            className="md:hidden relative -mx-2.5 -mt-2.5 mb-2 h-1.5 w-[calc(100%+20px)] cursor-pointer bg-white/10 overflow-hidden"
            title="Toca para adelantar o retroceder"
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-teal-400 to-cyan-400 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* ======================================================== */}
          {/* MOBILE COMPACT VIEW (< 768px)                            */}
          {/* ======================================================== */}
          <div className="flex md:hidden items-center justify-between gap-2">
            {/* Left: Artwork + Title + Producer (Tap opens YouTube Music playlist view!) */}
            <div
              onClick={() => setIsQueueOpen(true)}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group active:opacity-80 transition-opacity"
              title="Toca para abrir la lista de reproducción (YouTube Music style)"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-md">
                <img
                  src={currentBeat.coverUrl}
                  alt={currentBeat.title}
                  className={"h-full w-full object-cover transition-transform duration-500 " + (isPlaying ? "scale-105" : "scale-100")}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-purple-600/20 mix-blend-overlay animate-pulse" />
                )}
              </div>

              <div className="flex flex-col min-w-0 overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-bold text-white tracking-wide group-hover:text-purple-300 transition-colors">
                    {currentBeat.title}
                  </span>
                  <span className="shrink-0 rounded bg-purple-500/15 px-1 py-0.2 text-[9px] font-semibold text-purple-400 border border-purple-500/25">
                    {currentBeat.genre}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <span className="truncate">{currentBeat.producer.name}</span>
                  {currentBeat.producer.verified && (
                    <CheckCircle2 className="h-3 w-3 text-cyan-400 shrink-0" />
                  )}
                  <span>•</span>
                  <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                    {formatTime(currentTime)} / {formatTime(duration || currentBeat.duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Controls & License */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* YouTube Music Playlist / Queue Drawer Toggle Button (Mobile) */}
              <button
                onClick={() => setIsQueueOpen(true)}
                className="relative p-1.5 text-zinc-400 hover:text-purple-400 active:scale-95 transition-all"
                title="Lista de reproducción (YouTube Music style)"
                aria-label="Abrir playlist"
              >
                <ListMusic className="h-4 w-4 text-purple-300" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-purple-600 px-0.5 text-[8px] font-mono font-bold text-white shadow">
                    {queue.length}
                  </span>
                )}
              </button>

              {/* Like */}
              <button
                onClick={() => toggleFavorite(currentBeat.id)}
                className="p-1.5 text-zinc-400 hover:text-pink-500 transition-colors"
                aria-label="Dar me gusta"
              >
                <Heart
                  className={"h-4 w-4 transition-transform " + (isLiked ? "fill-pink-500 text-pink-500 scale-110" : "")}
                />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 text-white shadow-md shadow-purple-600/30 active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-white" />
                ) : (
                  <Play className="h-4 w-4 fill-white ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={nextBeat}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                aria-label="Siguiente"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              {/* Compact License Action */}
              {currentBeat.type === 'beat' && !currentBeat.isFree && currentBeat.priceFrom > 0 ? (
                <button
                  onClick={() => openLicenseModal(currentBeat)}
                  className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-600/30 active:scale-95 transition-all"
                  aria-label="Comprar licencia"
                >
                  <ShoppingCart className="h-3 w-3" />
                  <span className="font-mono text-[11px] font-black">${currentBeat.priceFrom}</span>
                </button>
              ) : (
                <a
                  href={currentBeat.audioPreviewUrl}
                  download={currentBeat.title + ".mp3"}
                  className="flex items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 p-1.5 text-purple-300 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                  aria-label="Descargar preview"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* DESKTOP FULL VIEW (>= 768px)                             */}
          {/* ======================================================== */}
          <div className="hidden md:flex md:items-center justify-between gap-6">
            
            {/* Left: Beat info & Cover (Clicking opens YouTube Music Playlist view!) */}
            <div
              onClick={() => setIsQueueOpen(true)}
              className="flex items-center gap-3.5 min-w-[220px] max-w-[320px] cursor-pointer group select-none"
              title="Clic para abrir la lista de reproducción completa (YouTube Music style)"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-md group-hover:border-purple-500/50 transition-colors">
                <img
                  src={currentBeat.coverUrl}
                  alt={currentBeat.title}
                  className={"h-full w-full object-cover transition-transform duration-500 " + (isPlaying ? "scale-105" : "scale-100")}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-purple-600/20 mix-blend-overlay animate-pulse" />
                )}
                {/* Mini expand indicator overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ChevronUp className="h-5 w-5 text-white" />
                </div>
              </div>

              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-white tracking-wide group-hover:text-purple-300 transition-colors">
                    {currentBeat.title}
                  </span>
                  <span className="shrink-0 rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-purple-400 border border-purple-500/25">
                    {currentBeat.genre}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="truncate hover:text-zinc-200 transition-colors">
                    {currentBeat.producer.name}
                  </span>
                  {currentBeat.producer.verified && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  )}
                  <span>•</span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {currentBeat.bpm} BPM
                  </span>
                  <span>•</span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {currentBeat.key}
                  </span>
                </div>
              </div>

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(currentBeat.id);
                }}
                className="ml-auto text-zinc-400 hover:text-pink-500 transition-colors p-1"
                aria-label="Dar me gusta"
              >
                <Heart
                  className={"h-4 w-4 transition-transform " + (isLiked ? "fill-pink-500 text-pink-500 scale-110" : "")}
                />
              </button>
            </div>

            {/* Center: Controls & Full-Width Waveform */}
            <div className="flex flex-1 flex-col items-center justify-center gap-1 min-w-0">
              <div className="flex items-center gap-4">
                {/* Previous */}
                <button
                  onClick={prevBeat}
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                  aria-label="Anterior"
                >
                  <SkipBack className="h-4 w-4" />
                </button>

                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 text-white shadow-lg shadow-purple-600/30 transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={nextBeat}
                  className="text-zinc-400 hover:text-white transition-colors p-1"
                  aria-label="Siguiente"
                >
                  <SkipForward className="h-4 w-4" />
                </button>

                {/* Repeat Loop Button */}
                <button
                  onClick={toggleRepeat}
                  className={"relative p-1.5 rounded-lg transition-all " + (
                    repeatMode !== 'off'
                      ? 'text-purple-300 bg-purple-500/20 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  )}
                  title={
                    repeatMode === 'one'
                      ? 'Bucle activo: Repitiendo esta canción (clic para desactivar)'
                      : repeatMode === 'all'
                      ? 'Bucle activo: Repitiendo lista completa (clic para repetir solo esta canción)'
                      : 'Bucle desactivado: Autoplay continuo / radio (clic para activar bucle)'
                  }
                  aria-label="Repetir bucle"
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="h-4 w-4" />
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                  {repeatMode !== 'off' && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                  )}
                </button>

                {/* YouTube Music Playlist / Queue Drawer Toggle Button (Desktop) */}
                <button
                  onClick={toggleQueueOpen}
                  className={"relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all " + (
                    isQueueOpen
                      ? 'text-purple-200 bg-purple-600/30 border-purple-500 shadow-md shadow-purple-600/30'
                      : 'text-zinc-400 hover:text-white bg-zinc-900 border-white/10 hover:border-white/20'
                  )}
                  title="Abrir Lista de Reproducción (YouTube Music style)"
                  aria-label="Abrir lista de reproducción"
                >
                  <ListMusic className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold">Lista</span>
                  {queue.length > 0 && (
                    <span className="rounded-full bg-purple-600/60 px-1.5 py-0.2 font-mono text-[10px] font-bold text-white">
                      {queue.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Waveform Scrubber with Time display spanning full width */}
              <div className="flex w-full items-center gap-3 px-2">
                <span className="w-9 text-right font-mono text-[11px] text-zinc-400 shrink-0">
                  {formatTime(currentTime)}
                </span>

                <div className="flex-1 min-w-0">
                  <WaveformVisualizer
                    waveform={currentBeat.waveform}
                    currentTime={currentTime}
                    duration={duration || currentBeat.duration}
                    isPlaying={isPlaying}
                    onSeek={handleSeekPercent}
                    height={28}
                  />
                </div>

                <span className="w-9 text-left font-mono text-[11px] text-zinc-500 shrink-0">
                  {formatTime(duration || currentBeat.duration)}
                </span>
              </div>
            </div>

            {/* Right: Volume & License Action */}
            <div className="flex items-center justify-end gap-4 min-w-[220px]">
              {/* Volume */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label="Silenciar"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-purple-500"
                />
              </div>

              {/* Instant License Buy Button or Free Download */}
              {currentBeat.type === 'beat' && !currentBeat.isFree && currentBeat.priceFrom > 0 ? (
                <button
                  onClick={() => openLicenseModal(currentBeat)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Licencia</span>
                  <span className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[11px] text-purple-200">
                    {"$" + currentBeat.priceFrom}
                  </span>
                </button>
              ) : (
                <a
                  href={currentBeat.audioPreviewUrl}
                  download={currentBeat.title + ".mp3"}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Descargar</span>
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
