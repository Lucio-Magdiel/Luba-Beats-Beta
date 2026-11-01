'use client';


import Link from 'next/link';
import { Play, Pause, ShoppingCart, Heart, CheckCircle2, Download, Headphones } from 'lucide-react';
import { Beat } from '@/types/beat';
import { useAudioStore } from '@/store/useAudioStore';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { formatPlays } from '@/lib/formatPlays';

interface BeatRowProps {
  beat: Beat;
  index: number;
}

export const BeatRow: React.FC<BeatRowProps> = ({ beat, index }) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const liked = isFavorite(beat.id);
  const { currentBeat, isPlaying, playBeat, pauseBeat } = useAudioStore();
  const { openLicenseModal } = useCartStore();

  const isCurrent = currentBeat?.id === beat.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const isBeat = beat.type === 'beat';

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaying) {
      pauseBeat();
    } else {
      playBeat(beat);
    }
  };

  return (
    <div
      onClick={() => playBeat(beat)}
      className={`group flex items-center justify-between gap-2 sm:gap-4 rounded-xl border p-2 sm:p-2.5 transition-all duration-200 cursor-pointer ${isCurrent
          ? isBeat
            ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md'
            : 'bg-purple-950/20 border-purple-500/40 shadow-md'
          : 'bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-white/15 border-white/5'
        }`}
    >
      {/* Index & Play Button & Cover */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Play/Index */}
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <span
            className={`hidden sm:inline-block font-mono text-xs font-semibold text-zinc-500 transition-opacity ${isCurrent ? 'opacity-0' : 'group-hover:opacity-0'
              }`}
          >
            {index + 1}
          </span>
          <button
            onClick={handlePlayToggle}
            aria-label={isCurrentPlaying ? 'Pausar' : 'Reproducir'}
            className={`absolute inset-0 flex items-center justify-center rounded-lg text-white transition-all ${isBeat ? 'bg-emerald-600' : 'bg-purple-600'
              } ${isCurrent
                ? 'opacity-100 scale-100 shadow-md'
                : 'opacity-90 sm:opacity-0 scale-90 sm:scale-75 sm:group-hover:opacity-100 sm:group-hover:scale-100'
              }`}
          >
            {isCurrentPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-white" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Thumbnail */}
        <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-lg border border-white/10">
          <img
            src={beat.coverUrl}
            alt={beat.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Title & Producer & Badge */}
        <div className="flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href={`/beat/${beat.slug || beat.id}`}
              onClick={(e) => e.stopPropagation()}
              className={`truncate text-xs sm:text-sm font-bold tracking-tight transition-colors hover:underline ${isCurrent
                  ? isBeat
                    ? 'text-emerald-400'
                    : 'text-purple-400'
                  : 'text-white'
                }`}
            >
              {beat.title}
            </Link>
            <span
              className={`hidden xs:inline-block text-[8px] sm:text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${isBeat
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                }`}
            >
              {isBeat ? 'BEAT' : 'MÚSICA'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400">
            <Link
              href={`/perfil/${beat.producer.handle || beat.producer.name}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate hover:text-zinc-200 transition-colors"
            >
              {beat.producer.name}
            </Link>
            {beat.producer.verified && (
              <CheckCircle2
                className={`h-3 w-3 shrink-0 ${isBeat ? 'text-emerald-400' : 'text-purple-400'}`}
              />
            )}
            <span className="sm:hidden text-zinc-600">•</span>
            <span
              className="sm:hidden inline-flex items-center gap-0.5 text-[10px] text-zinc-400 font-mono"
              title={`${beat.plays.toLocaleString()} vistas`}
            >
              <Headphones className="h-2.5 w-2.5 text-zinc-500" />
              <span>{formatPlays(beat.plays)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Musical Specs: Genre, BPM, Key, Plays */}
      <div className="hidden sm:flex items-center gap-3 text-xs">
        <span
          className={`rounded-md px-2 py-0.5 font-semibold border ${isBeat
              ? 'bg-zinc-900 text-emerald-300 border-emerald-500/20'
              : 'bg-zinc-900 text-purple-300 border-purple-500/20'
            }`}
        >
          {beat.genre}
        </span>
        <span className="font-mono text-zinc-400">{beat.bpm} BPM</span>
        <span className="rounded-md bg-zinc-900 px-2 py-0.5 font-mono text-cyan-300 border border-cyan-500/20">
          {beat.key}
        </span>
        <span
          className="flex items-center gap-1 font-mono text-[11px] text-zinc-400"
          title={`${beat.plays.toLocaleString()} reproducciones / vistas`}
        >
          <Headphones className="h-3.5 w-3.5 text-zinc-500" />
          <span>{formatPlays(beat.plays)}</span>
        </span>
      </div>

      {/* Duration */}
      <div className="hidden md:block font-mono text-xs text-zinc-500">
        {beat.durationFormatted}
      </div>

      {/* Right: Like, Price & Action Button */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(beat.id);
          }}
          className="flex items-center gap-1 text-zinc-500 hover:text-pink-500 transition-colors p-1"
          aria-label="Me gusta"
          title={`${beat.likes ?? 0} me gusta`}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
          <span className="font-mono text-[11px] text-zinc-400">{beat.likes ?? 0}</span>
        </button>

        {/* Price Tag or GRATIS */}
        <div className="flex flex-col items-end min-w-[50px] sm:min-w-[70px]">
          {isBeat ? (
            <>
              <span className="font-mono text-xs sm:text-sm font-black text-emerald-400">
                ${beat.priceFrom.toFixed(2)}
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-400">
                S/. {beat.priceFromPEN}
              </span>
            </>
          ) : (
            <span className="font-mono text-[11px] sm:text-xs font-black text-purple-400 tracking-wider">
              GRATIS
            </span>
          )}
        </div>

        {/* Action Button */}
        {isBeat ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLicenseModal(beat);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-600 hover:text-white"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Licencia</span>
          </button>
        ) : (
          <a
            href={beat.audioPreviewUrl}
            download={`${beat.title}.mp3`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-purple-300 transition-all hover:bg-purple-600 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Descargar</span>
          </a>
        )}
      </div>
    </div>
  );
};
