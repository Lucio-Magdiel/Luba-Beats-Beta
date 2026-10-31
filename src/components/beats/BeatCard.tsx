'use client';


import Link from 'next/link';
import { Play, Pause, ShoppingCart, Heart, CheckCircle2, Download } from 'lucide-react';
import { Beat } from '@/types/beat';
import { useAudioStore } from '@/store/useAudioStore';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface BeatCardProps {
  beat: Beat;
}

export const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const liked = isFavorite(beat.id);
  const { currentBeat, isPlaying, playBeat, pauseBeat } = useAudioStore();
  const { openLicenseModal } = useCartStore();

  const isCurrent = currentBeat?.id === beat.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const isBeat = beat.type === 'beat';
  const isFree = beat.isFree || beat.priceFrom === 0;

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaying) {
      pauseBeat();
    } else {
      playBeat(beat);
    }
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-zinc-950/80 p-3.5 transition-all duration-300 hover:-translate-y-1 ${
        isBeat
          ? 'border-emerald-500/25 hover:border-emerald-400/80 hover:shadow-2xl hover:shadow-emerald-500/15'
          : 'border-purple-500/25 hover:border-purple-400/80 hover:shadow-2xl hover:shadow-purple-500/15'
      }`}
    >
      {/* Sleek Ambient Edge Glow at top of card */}
      <div
        className={`pointer-events-none absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300 ${
          isBeat
            ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-75 group-hover:opacity-100'
            : 'bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-75 group-hover:opacity-100'
        }`}
      />

      {/* Cover Image & Overlay Play */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/5 bg-zinc-900">
        <img
          src={beat.coverUrl}
          alt={beat.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges: Type Pill + Genre + BPM */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[calc(100%-48px)]">
          {/* Subtle Category Pill: BEAT or MÚSICA */}
          <span
            className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm ${
              isBeat
                ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40'
                : 'bg-purple-950/85 text-purple-300 border-purple-500/40'
            }`}
          >
            {isBeat ? '🟢 BEAT' : '🟣 MÚSICA'}
          </span>

          <span
            className={`rounded-lg bg-zinc-900/90 px-2 py-0.5 text-[10px] font-bold backdrop-blur-md border ${
              isBeat
                ? 'text-emerald-300 border-emerald-500/30'
                : 'text-purple-300 border-purple-500/30'
            }`}
          >
            {beat.genre}
          </span>
          <span className="rounded-lg bg-zinc-900/90 px-2 py-0.5 text-[10px] font-mono text-zinc-300 backdrop-blur-md border border-white/10">
            {beat.bpm} BPM
          </span>
        </div>

        {/* Like Button on Top Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(beat.id);
          }}
          className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-zinc-300 backdrop-blur-md transition-transform hover:scale-110 hover:text-pink-500"
          aria-label="Guardar en favoritos"
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
        </button>

        {/* Big Center Play/Pause button with Colored Neon Gradient */}
        <button
          onClick={handleTogglePlay}
          aria-label={isCurrentPlaying ? 'Pausar' : 'Reproducir'}
          className={`absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
            isBeat
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-400 shadow-emerald-500/40'
              : 'bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 shadow-purple-600/40'
          } ${
            isCurrent
              ? isCurrentPlaying
                ? 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto'
                : 'opacity-100 scale-100'
              : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
          }`}
        >
          {isCurrentPlaying ? (
            <Pause className="h-6 w-6 fill-white" />
          ) : (
            <Play className="h-6 w-6 fill-white ml-0.5" />
          )}
        </button>

        {/* Bottom Key badge */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="rounded-lg bg-black/70 px-2 py-1 text-[10px] font-mono text-cyan-300 backdrop-blur-md border border-cyan-500/30">
            {beat.key}
          </span>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 text-[11px] font-mono text-zinc-400 bg-black/70 px-1.5 py-0.5 rounded">
          {beat.durationFormatted}
        </div>
      </div>

      {/* Metadata & Actions */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          {/* Title with Category-Aware Hover linking to Beat Detail */}
          <Link
            href={`/beat/${beat.slug || beat.id}`}
            className={`block truncate text-base font-bold text-white transition-colors ${
              isBeat ? 'hover:text-emerald-400' : 'hover:text-purple-400'
            }`}
          >
            {beat.title}
          </Link>

          {/* Producer / Artist linking to Public Profile */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
            <Link
              href={`/perfil/${beat.producer.handle || beat.producer.name}`}
              className="truncate hover:text-zinc-200 transition-colors"
            >
              {beat.producer.name}
            </Link>
            {beat.producer.verified && (
              <CheckCircle2
                className={`h-3.5 w-3.5 shrink-0 ${
                  isBeat ? 'text-emerald-400' : 'text-purple-400'
                }`}
              />
            )}
          </div>
        </div>

        {/* Footer: Price & Action Button */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          {isFree ? (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                Acceso
              </span>
              <span className="text-base font-black tracking-wider text-purple-400">
                GRATIS
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                Licencia desde
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-emerald-400">
                  ${beat.priceFrom.toFixed(2)}
                </span>
                <span className="text-[11px] font-medium text-zinc-400">
                  (S/. {beat.priceFromPEN})
                </span>
              </div>
            </div>
          )}

          {isFree ? (
            <a
              href={beat.audioPreviewUrl}
              download={`${beat.title}.mp3`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-bold text-purple-300 transition-all hover:bg-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-600/30"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar</span>
            </a>
          ) : (
            <button
              onClick={() => openLicenseModal(beat)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-600/30"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Comprar</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
