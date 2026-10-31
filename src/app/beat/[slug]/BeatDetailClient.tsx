'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Heart,
  Share2,
  Download,
  ShoppingBag,
  CheckCircle2,
  Disc3,
  Mic,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Radio,
  Video,
  Layers,
  Clock,
  Check,
} from 'lucide-react';
import { Beat, LicenseTier } from '@/types/beat';
import { useAudioStore } from '@/store/useAudioStore';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';

interface Props {
  beat: Beat;
}

export function BeatDetailClient({ beat }: Props) {
  const { currentBeat, isPlaying, playBeat, togglePlay, currentTime, duration, seek } = useAudioStore();
  const { addItem, setIsCartOpen } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const isCurrent = currentBeat?.id === beat.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const isBeat = beat.type === 'beat';
  const isFree = beat.isFree || beat.priceFrom === 0;

  const [selectedTier, setSelectedTier] = useState<LicenseTier>('premium');
  const liked = isFavorite(beat.id);
  const [likeCount, setLikeCount] = useState(beat.likes);
  const [copied, setCopied] = useState(false);

  // Auto-hide play/pause button overlay on cover image when playing
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerOverlayVisibility = () => {
    setIsOverlayVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isCurrentPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setIsOverlayVisible(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (!isCurrentPlaying) return;

    const timer = setTimeout(() => {
      setIsOverlayVisible(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [isCurrentPlaying]);

  const licenses = beat.licenses || [];
  const selectedLicense = licenses.find((l) => l.tier === selectedTier) || licenses[0];
  const hasLicenses = licenses.length > 0 && !!selectedLicense;

  const handleTogglePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playBeat(beat);
    }
  };

  const handleLike = async () => {
    const res = await toggleFavorite(beat.id);
    if (res.totalLikes !== undefined) {
      setLikeCount(res.totalLikes);
    } else {
      setLikeCount((prev) => (res.isFavorite ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddToCart = () => {
    if (selectedLicense) {
      addItem(beat, selectedLicense);
      setIsCartOpen(true);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const currentSecs = isCurrent ? currentTime : 0;
  const totalSecs = isCurrent && duration > 0 ? duration : beat.duration;
  const progressRatio = totalSecs > 0 ? (currentSecs / totalSecs) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-32">
      {/* Ambient Top Glows */}
      <div className="relative overflow-hidden">
        <div
          className={`absolute top-0 left-1/4 h-[420px] w-[500px] rounded-full blur-[140px] pointer-events-none -translate-y-1/2 opacity-25 ${isBeat ? 'bg-emerald-500' : 'bg-purple-600'
            }`}
        />
        <div className="absolute top-20 right-1/4 h-[350px] w-[450px] rounded-full blur-[140px] pointer-events-none -translate-y-1/2 opacity-20 bg-cyan-500" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb Back */}
          <Link
            href="/#catalogo"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver al Catálogo</span>
          </Link>

          {/* Main Hero Card */}
          <div
            className={`relative rounded-3xl border p-6 md:p-8 backdrop-blur-2xl shadow-2xl transition-all ${isBeat
              ? 'bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-emerald-500/30 shadow-emerald-950/20'
              : 'bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-purple-500/30 shadow-purple-950/20'
              }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Left Column: Artwork + Quick Badge */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div onMouseEnter={triggerOverlayVisibility} onMouseMove={triggerOverlayVisibility} className="relative group w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src={beat.coverUrl}
                    alt={beat.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-md shadow-lg ${isBeat
                        ? 'bg-emerald-600/90 border border-emerald-400/40'
                        : 'bg-purple-600/90 border border-purple-400/40'
                        }`}
                    >
                      {isBeat ? <Disc3 className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                      {isBeat ? 'Beat Instrumental' : 'Música'}
                    </span>
                  </div>

                  {/* Big Hero Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlay();
                      triggerOverlayVisibility();
                    }}
                    aria-label={isCurrentPlaying ? 'Pausar' : 'Reproducir'}
                    className={`absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${!isCurrentPlaying || isOverlayVisible
                      ? 'opacity-100 scale-100 pointer-events-auto'
                      : 'opacity-0 scale-90 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
                      } ${isBeat
                        ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 shadow-emerald-500/50'
                        : 'bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 shadow-purple-600/50'
                      }`}
                  >
                    {isCurrentPlaying ? (
                      <Pause className="h-8 w-8 fill-white" />
                    ) : (
                      <Play className="h-8 w-8 fill-white ml-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Title, Producer, Meta Badges & Waveform */}
              <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                <div>
                  {/* Mood & Genre Pills */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300">
                      {beat.genre}
                    </span>
                    <span className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-xs font-mono font-semibold text-cyan-300">
                      {beat.bpm} BPM
                    </span>
                    <span className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-xs font-mono font-semibold text-indigo-300">
                      {beat.key}
                    </span>
                    <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-medium text-purple-300">
                      {beat.mood}
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                    {beat.title}
                  </h1>

                  {/* Producer Info & Link */}
                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href={`/perfil/${beat.producer.handle}`}
                      className="flex items-center gap-2.5 group/prod"
                    >
                      <img
                        src={beat.producer.avatar}
                        alt={beat.producer.name}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-500/40 group-hover/prod:ring-purple-400 transition-all"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-zinc-200 group-hover/prod:text-white transition-colors">
                          {beat.producer.name}
                        </span>
                        {beat.producer.verified && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                    </Link>

                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {beat.durationFormatted}
                    </span>
                  </div>
                </div>

                {/* Interactive Waveform Bar */}
                <div className="rounded-2xl bg-black/40 border border-white/5 p-4 space-y-2">
                  <div
                    onClick={(e) => {
                      if (!isCurrent) {
                        playBeat(beat);
                        return;
                      }
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      seek(clickPos * totalSecs);
                    }}
                    className="relative flex h-14 w-full cursor-pointer items-center justify-between gap-1 px-1 group/wave"
                  >
                    {beat.waveform.map((val, idx) => {
                      const barPercent = (idx / beat.waveform.length) * 100;
                      const isPast = isCurrent && barPercent <= progressRatio;
                      return (
                        <div
                          key={idx}
                          style={{ height: `${Math.max(12, val * 100)}%` }}
                          className={`w-full rounded-full transition-all duration-150 group-hover/wave:scale-y-110 ${isPast
                            ? isBeat
                              ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                              : 'bg-gradient-to-t from-purple-500 to-pink-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                            : 'bg-zinc-800 hover:bg-zinc-700'
                            }`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-xs font-mono text-zinc-500">
                    <span>{formatTime(currentSecs)}</span>
                    <span className="text-zinc-400">Haz clic en la onda sonora para saltar</span>
                    <span>{formatTime(totalSecs)}</span>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Primary Play Button */}
                  <button
                    onClick={handleTogglePlay}
                    className={`flex items-center gap-2.5 rounded-xl px-5 py-3 font-extrabold text-sm text-white shadow-xl transition-all active:scale-[0.98] ${isBeat
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                      }`}
                  >
                    {isCurrentPlaying ? (
                      <>
                        <Pause className="h-4 w-4 fill-white" /> Pausar Reproducción
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-white" /> Escuchar Vista Previa
                      </>
                    )}
                  </button>

                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${liked
                      ? 'border-pink-500/40 bg-pink-500/10 text-pink-400'
                      : 'border-white/10 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-pink-500' : ''}`} />
                    <span>{likeCount}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
                  </button>

                  {/* Direct Download if free */}
                  {isFree && (
                    <a
                      href={beat.audioPreviewUrl}
                      download={`${beat.title}.mp3`}
                      className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-600/20 px-4 py-3 text-sm font-bold text-purple-300 hover:bg-purple-600/30 transition-all ml-auto"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descarga Gratuita</span>
                    </a>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Licenses Matrix (For Beats) or Stream Info (For Musica) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        {isBeat && hasLicenses && selectedLicense ? (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Licencias Oficiales Disponibles
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  Elige la Licencia para tu Canción
                </h2>
              </div>
              <p className="text-xs text-zinc-400 max-w-md">
                Todas las licencias incluyen entrega digital instantánea y contrato en PDF firmado por el productor.
              </p>
            </div>

            {/* License Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {licenses.map((lic) => {
                const isSelected = selectedTier === lic.tier;
                const isPremium = lic.tier === 'premium';
                const isExclusive = lic.tier === 'exclusive';

                return (
                  <div
                    key={lic.tier}
                    onClick={() => setSelectedTier(lic.tier)}
                    className={`relative cursor-pointer rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${isSelected
                      ? isExclusive
                        ? 'border-cyan-400/80 bg-cyan-950/20 ring-2 ring-cyan-400/50 shadow-xl shadow-cyan-950/40'
                        : isPremium
                          ? 'border-emerald-400/80 bg-emerald-950/20 ring-2 ring-emerald-400/50 shadow-xl shadow-emerald-950/40'
                          : 'border-purple-400/80 bg-purple-950/20 ring-2 ring-purple-400/50 shadow-xl shadow-purple-950/40'
                      : 'border-white/10 bg-zinc-900/60 hover:border-white/20 hover:bg-zinc-900/90'
                      }`}
                  >
                    {/* Badge */}
                    {isPremium && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-950 shadow-md">
                        Más Popular
                      </div>
                    )}
                    {isExclusive && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-950 shadow-md">
                        Derechos Totales
                      </div>
                    )}

                    <div>
                      {/* Tier Name */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">{lic.name}</h3>
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center ${isSelected
                            ? 'border-emerald-400 bg-emerald-500 text-zinc-950'
                            : 'border-zinc-700 bg-transparent'
                            }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">${lic.price}</span>
                        <span className="text-sm font-mono text-zinc-400">
                          (aprox. S/ {lic.pricePEN})
                        </span>
                      </div>

                      {/* Formats included */}
                      <div className="mt-3 rounded-lg bg-black/40 border border-white/5 p-2 text-xs font-mono text-emerald-300 flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{lic.format}</span>
                      </div>

                      {/* Benefits List */}
                      <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span>{lic.streamsLimit}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-cyan-400 shrink-0" />
                          <span>{lic.musicVideoLimit}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Radio
                            className={`h-4 w-4 shrink-0 ${lic.radioBroadcasting ? 'text-emerald-400' : 'text-zinc-600'
                              }`}
                          />
                          <span className={lic.radioBroadcasting ? '' : 'text-zinc-500 line-through'}>
                            Emisión en Radio Comercial
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <ShieldCheck
                            className={`h-4 w-4 shrink-0 ${lic.forProfitPerformances ? 'text-emerald-400' : 'text-zinc-600'
                              }`}
                          />
                          <span
                            className={
                              lic.forProfitPerformances ? '' : 'text-zinc-500 line-through'
                            }
                          >
                            Conciertos & Shows con fin de lucro
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Bottom CTA Button inside card */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTier(lic.tier);
                        handleAddToCart();
                      }}
                      className={`mt-6 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${isSelected
                        ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-white/10 text-white hover:bg-white/15'
                        }`}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{isSelected ? 'Comprar Esta Licencia' : 'Seleccionar'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Selected License Summary Box & Checkout Action */}
            <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs uppercase font-mono text-zinc-400">
                  Licencia elegida actualmente:
                </span>
                <h4 className="text-xl font-black text-white mt-0.5">
                  {selectedLicense.name} — ${selectedLicense.price} USD / S/ {selectedLicense.pricePEN} PEN
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  {selectedLicense.description}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 md:flex-none py-3.5 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Añadir al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        ) : isBeat ? (
          /* For Free Beat without paid licenses */
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Beat de Descarga Libre</h3>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto">
              Esta instrumental está disponible para descarga gratuita para proyectos no comerciales o grabación de demos dando créditos al productor.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <a
                href={beat.audioPreviewUrl}
                download={`${beat.title}.mp3`}
                className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar MP3 Gratuito</span>
              </a>
            </div>
          </div>
        ) : (
          /* For Musica (Non-beat) */
          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Lanzamiento Musical Oficial</h3>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto">
              Esta pista ha sido publicada como una obra musical completa para disfrute y streaming gratuito por la comunidad de Luba Beats.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <button
                onClick={handleTogglePlay}
                className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                {isCurrentPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isCurrentPlaying ? 'Pausar' : 'Reproducir Ahora'}
              </button>
            </div>
          </div>
        )}

        {/* Producer Detailed Info Card */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 md:p-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <img
                src={beat.producer.avatar}
                alt={beat.producer.name}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-purple-500/50 shadow-lg"
              />
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-lg font-bold text-white">{beat.producer.name}</h3>
                  {beat.producer.verified && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  @{beat.producer.handle} • {beat.producer.country}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Productor oficial verificado en Luba Beats
                </p>
              </div>
            </div>

            <Link
              href={`/perfil/${beat.producer.handle}`}
              className="py-2.5 px-5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 text-xs font-bold text-white transition-all shadow-md"
            >
              Ver Perfil & Catálogo Completo
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
