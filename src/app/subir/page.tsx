'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  UploadCloud,
  Disc3,
  Music2,
  FileAudio,
  Image as ImageIcon,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  Play,
  RotateCcw,
  AlertCircle,
  Loader2,
  Mic,
  Lock,
} from 'lucide-react';
import { ItemType, MusicalKey, MusicGenre, MusicMood, Beat } from '@/types/beat';
import { MOCK_GENRES, MOCK_KEYS } from '@/data/mockBeats';
import { useAudioStore } from '@/store/useAudioStore';

export default function SubirBeatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addUploadedBeat, playBeat } = useAudioStore();

  const userRole = (session?.user as { role?: string })?.role;
  const isArtist = userRole === 'artista';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/subir');
    } else if (status === 'authenticated') {
      if (userRole === 'comprador') {
        router.push('/#catalogo');
      }
    }
  }, [status, userRole, router]);

  const [type, setType] = useState<ItemType>('beat');

  // Si el usuario es artista, forzar tipo 'musica' y precio 0 permanentemente
  useEffect(() => {
    if (isArtist) {
      setType('musica');
      setPrice(0);
    }
  }, [isArtist]);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState<MusicGenre>('Trap');
  const [bpm, setBpm] = useState<number>(140);
  const [key, setKey] = useState<MusicalKey>('C Minor');
  const [mood, setMood] = useState<MusicMood>('Energético');
  const [price, setPrice] = useState<number>(25);
  const [tags, setTags] = useState<string>('Trap, 808, Latino');

  // File states
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedBeat, setUploadedBeat] = useState<Beat | null>(null);

  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const isBeat = type === 'beat';

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-zinc-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span>Verificando sesión...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Handle Audio File Selection
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
      setErrorMessage('Por favor selecciona un archivo de audio válido (.mp3, .wav)');
      return;
    }

    setAudioFile(file);
    setAudioPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);

    // Auto-fill title from filename if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  // Handle Cover File Selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image') && !file.type.includes('video')) {
      setErrorMessage('Por favor selecciona una imagen (.jpg, .png, .webp) o video (.mp4)');
      return;
    }

    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      setErrorMessage('Debes adjuntar el archivo de audio (.mp3 o .wav)');
      return;
    }

    if (!coverFile) {
      setErrorMessage('Debes adjuntar la portada o video visual');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Ingresa un título para la pista');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('cover', coverFile);
      formData.append('title', title.trim());
      formData.append('type', type);
      formData.append('genre', genre);
      formData.append('bpm', bpm.toString());
      formData.append('key', key);
      formData.append('mood', mood);
      formData.append('price', price.toString());
      formData.append('tags', tags);

      const response = await fetch('/api/beats/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la subida de los archivos');
      }

      // Add to client state so it appears in catalog immediately
      addUploadedBeat(data.beat);
      setUploadedBeat(data.beat);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Error inesperado durante la subida'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setUploadedBeat(null);
    setErrorMessage(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-5xl">
        <div
          className={`absolute top-0 left-1/4 h-[350px] w-[350px] rounded-full blur-[140px] transition-colors duration-500 ${
            isBeat ? 'bg-emerald-500/15' : 'bg-purple-600/20'
          }`}
        />
      </div>

      {/* Breadcrumb / Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Catálogo</span>
      </Link>

      {/* SUCCESS MODAL / CELEBRATION BANNER */}
      {uploadedBeat ? (
        <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-8 text-center shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            ¡Publicación Exitosa en Luba Beats!
          </h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
            Tu pista <strong className="text-white font-bold">«{uploadedBeat.title}»</strong> ya está disponible en el catálogo interactivo de Luba Beats.
          </p>

          {/* Mini Preview Card */}
          <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-white/10 bg-zinc-900/90 p-3 shadow-xl text-left">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-800">
              <img
                src={uploadedBeat.coverUrl}
                alt={uploadedBeat.title}
                className="h-full w-full object-cover"
              />
              <span
                className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-black uppercase border ${
                  uploadedBeat.type === 'beat'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                }`}
              >
                {uploadedBeat.type === 'beat' ? '🟢 BEAT' : '🟣 MÚSICA'}
              </span>
            </div>
            <div className="mt-2.5">
              <h4 className="font-extrabold text-white truncate">{uploadedBeat.title}</h4>
              <p className="text-xs text-zinc-400">{uploadedBeat.genre} • {uploadedBeat.bpm} BPM</p>
              <p className="text-sm font-bold text-emerald-400 mt-1">
                {uploadedBeat.type === 'beat' ? `$${uploadedBeat.priceFrom.toFixed(2)}` : 'GRATIS'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => playBeat(uploadedBeat)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-black text-zinc-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
            >
              <Play className="h-4 w-4 fill-zinc-950" />
              <span>Reproducir Ahora</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-6 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition-all"
            >
              <span>Ver en el Catálogo</span>
            </button>

            <button
              onClick={resetForm}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-5 py-3 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Subir Otro</span>
            </button>
          </div>
        </div>
      ) : (
        /* UPLOAD FORM */
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-6 mb-8">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg ${
                isArtist
                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                  : isBeat
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              }`}
            >
              {isArtist ? <Mic className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  {isArtist
                    ? 'Subir Canción a Luba Beats'
                    : isBeat
                    ? 'Subir Instrumental a Luba Beats Beta'
                    : 'Subir Canción a Luba Beats Beta'}
                </h1>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isArtist
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isArtist ? 'Rol: Artista' : 'Rol: Productor'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isArtist
                  ? 'Distribución y streaming de canciones libres para oyentes y seguidores en la plataforma.'
                  : 'Publica tus instrumentales con licencias comerciales o tus canciones para streaming libre.'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs font-medium text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Category Switcher (Beat vs Música) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">
                  Tipo de Publicación
                </label>
                {isArtist && (
                  <span className="text-[10px] font-mono text-purple-400">
                    Solo canciones (streaming libre)
                  </span>
                )}
              </div>

              {isArtist ? (
                /* Vista de restricción para Artistas: No pueden vender ni subir beats */
                <div className="space-y-3">
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-3.5 flex items-start gap-3">
                    <Mic className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      Como <strong>Artista</strong>, puedes publicar tus <strong>canciones y temas propios</strong> para que la comunidad los escuche y reproduzca libremente. La subida y venta de beats instrumentales está reservada exclusivamente para perfiles de <strong>Productor</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      title="La venta y subida de beats está reservada exclusivamente para Productores"
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-zinc-950/40 p-3.5 text-xs font-bold text-zinc-600 cursor-not-allowed opacity-50"
                    >
                      <Lock className="h-3.5 w-3.5 text-zinc-600" />
                      <span>🟢 Beat (Solo Productores)</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-purple-500/60 bg-purple-950/40 text-white shadow-lg shadow-purple-500/10 p-3.5 text-xs font-bold">
                      <Music2 className="h-4 w-4 text-purple-400" />
                      <span>🟣 Canción (Streaming Libre)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Vista para Productores y Super Admins: Pueden subir beats comerciales o canciones para streaming */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setType('beat')}
                    className={`flex items-center justify-center gap-2.5 rounded-2xl border p-3.5 sm:p-4 text-xs font-bold transition-all ${
                      isBeat
                        ? 'border-emerald-500/60 bg-emerald-950/40 text-white shadow-lg shadow-emerald-500/10'
                        : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Disc3 className={`h-4 w-4 ${isBeat ? 'text-emerald-400' : ''}`} />
                    <span>🟢 Beat (Para Venta de Licencias)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setType('musica');
                      setPrice(0);
                    }}
                    className={`flex items-center justify-center gap-2.5 rounded-2xl border p-3.5 sm:p-4 text-xs font-bold transition-all ${
                      !isBeat
                        ? 'border-purple-500/60 bg-purple-950/40 text-white shadow-lg shadow-purple-500/10'
                        : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Music2 className={`h-4 w-4 ${!isBeat ? 'text-purple-400' : ''}`} />
                    <span>🟣 Canción (Streaming Libre)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. File Upload Dropzones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Audio Dropzone */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                  1. Archivo de Audio (.mp3 / .wav) <span className="text-rose-400">*</span>
                </label>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/mp3,audio/wav,audio/*"
                  onChange={handleAudioChange}
                  className="hidden"
                />

                <div
                  onClick={() => audioInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                    audioFile
                      ? 'border-emerald-500/60 bg-emerald-950/20'
                      : 'border-white/15 bg-zinc-900/40 hover:border-white/30 hover:bg-zinc-900/70'
                  }`}
                >
                  <FileAudio
                    className={`h-10 w-10 mb-2 ${
                      audioFile ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  />
                  {audioFile ? (
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[220px]">
                        {audioFile.name}
                      </p>
                      <p className="text-[11px] text-emerald-400 mt-1">
                        {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Listo para subir
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-white">Haz clic o arrastra tu audio</p>
                      <p className="text-[11px] text-zinc-500 mt-1">MP3 320kbps o WAV 24-bit</p>
                    </div>
                  )}
                </div>

                {/* Audio preview player */}
                {audioPreviewUrl && (
                  <div className="mt-3">
                    <audio src={audioPreviewUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>

              {/* Cover / Visual Dropzone */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                  2. Portada o Loop (.jpg / .png / .mp4) <span className="text-rose-400">*</span>
                </label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4"
                  onChange={handleCoverChange}
                  className="hidden"
                />

                <div
                  onClick={() => coverInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all relative overflow-hidden ${
                    coverFile
                      ? 'border-purple-500/60 bg-purple-950/20'
                      : 'border-white/15 bg-zinc-900/40 hover:border-white/30 hover:bg-zinc-900/70'
                  }`}
                >
                  {coverPreviewUrl ? (
                    <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-white/20 shadow-md">
                      <img
                        src={coverPreviewUrl}
                        alt="Preview Portada"
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={`absolute top-1 right-1 rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${
                          isBeat ? 'bg-emerald-500 text-zinc-950' : 'bg-purple-600 text-white'
                        }`}
                      >
                        {isBeat ? 'BEAT' : 'MÚSICA'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-zinc-500 mb-2" />
                      <p className="text-xs font-bold text-white">Haz clic para subir portada</p>
                      <p className="text-[11px] text-zinc-500 mt-1">JPG, PNG o MP4 (1:1 recomendado)</p>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* 3. Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/5">
              
              {/* Título */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  {isArtist ? 'Título de la Canción' : isBeat ? 'Título del Beat' : 'Título de la Canción'} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isArtist
                      ? 'Ej. Noche en Medellín, Ella Baila Sola, Mi Destino...'
                      : 'Ej. Tokio Drift 808, Sueños de Medianoche...'
                  }
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Género */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Género</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as MusicGenre)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-emerald-500"
                >
                  {MOCK_GENRES.filter((g) => g !== 'Todos').map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Escala / Key */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Tonalidad Musical (Key)
                </label>
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value as MusicalKey)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-emerald-500"
                >
                  {MOCK_KEYS.filter((k) => k !== 'Cualquier Tonalidad').map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* BPM Slider & Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-300">Tempo (BPM)</label>
                  <span className="font-mono text-xs font-bold text-emerald-400">{bpm} BPM</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 appearance-none rounded-lg bg-zinc-800 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Mood */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">Estado Anímico</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value as MusicMood)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-emerald-500"
                >
                  <option value="Energético">Energético</option>
                  <option value="Oscuro (Dark)">Oscuro (Dark)</option>
                  <option value="Melancólico">Melancólico</option>
                  <option value="Chill / Relax">Chill / Relax</option>
                  <option value="Romántico">Romántico</option>
                  <option value="Agresivo">Agresivo</option>
                  <option value="Trippy">Trippy</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Etiquetas (Separadas por coma)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ej. Trap Latino, 808, Bad Bunny"
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Precio Base / Monetización */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  {isArtist ? 'Monetización' : 'Precio Base (USD)'}
                </label>
                {isArtist ? (
                  <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 px-4 py-2.5 text-xs font-black text-purple-300 flex items-center justify-between">
                    <span>GRATIS (Streaming y distribución libre para oyentes)</span>
                    <span className="text-[10px] font-mono text-purple-400/80">No comercial</span>
                  </div>
                ) : isBeat ? (
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="number"
                      min="5"
                      max="500"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-9 pr-20 py-2 text-sm text-white font-mono font-bold outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500">
                      ≈ S/. {Math.round(price * 3.75)}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 px-4 py-2.5 text-xs font-black text-purple-300">
                    GRATIS (Canción para streaming libre)
                  </div>
                )}
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isUploading}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black transition-all shadow-xl ${
                  isUploading
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : isBeat && !isArtist
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Subiendo y procesando audio en Luba Beats...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-5 w-5" />
                    <span>
                      {isArtist
                        ? 'Publicar Canción en Luba Beats'
                        : isBeat
                        ? 'Publicar Beat para Venta'
                        : 'Publicar Canción en Luba Beats'}
                    </span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
