'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Mic,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Play,
  Pause,
  Search,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
} from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { Beat } from '@/types/beat';

interface TrackItem {
  id: number;
  titulo: string;
  tipo: string;
  genero: string;
  bpm: number;
  mood: string;
  nota_musical: string;
  precio: number;
  estado: string;
  duracion: string;
  archivo_visual: string;
  archivo_preview: string;
  fecha_subida: string;
}

interface Props {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
  initialTracks: TrackItem[];
}

export function ArtistPanelClient({ user, initialTracks }: Props) {
  const [tracks, setTracks] = useState<TrackItem[]>(initialTracks);
  const [filter, setFilter] = useState<'todos' | 'publico' | 'oculto'>('todos');
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [editingTrack, setEditingTrack] = useState<TrackItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { currentBeat, isPlaying, playBeat, pauseBeat } = useAudioStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const totalTracks = tracks.length;
  const publicTracks = tracks.filter((b) => b.estado === 'publico').length;
  const hiddenTracks = tracks.filter((b) => b.estado === 'oculto' || b.estado === 'privado').length;

  // Filtered tracks
  const filteredTracks = tracks.filter((b) => {
    if (filter === 'publico' && b.estado !== 'publico') return false;
    if (filter === 'oculto' && b.estado === 'publico') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.titulo.toLowerCase().includes(q) ||
        b.genero.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Toggle Visibility
  const handleToggleVisibility = async (track: TrackItem) => {
    const newStatus = track.estado === 'publico' ? 'oculto' : 'publico';
    setLoadingId(track.id);

    try {
      const res = await fetch(`/api/beats/${track.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (res.ok) {
        setTracks((prev) =>
          prev.map((b) => (b.id === track.id ? { ...b, estado: newStatus } : b))
        );
        showToast(
          newStatus === 'publico'
            ? `"${track.titulo}" ahora es pública para los oyentes.`
            : `"${track.titulo}" fue ocultada.`
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Error al cambiar visibilidad.');
    } finally {
      setLoadingId(null);
    }
  };

  // Delete Track
  const handleDelete = async (id: number) => {
    setLoadingId(id);

    try {
      const res = await fetch(`/api/beats/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTracks((prev) => prev.filter((b) => b.id !== id));
        setDeletingId(null);
        showToast('Canción eliminada del catálogo.');
      } else {
        showToast('No se pudo eliminar la pista.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red al eliminar.');
    } finally {
      setLoadingId(null);
    }
  };

  // Save Edit Changes
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;

    setLoadingId(editingTrack.id);

    try {
      const res = await fetch(`/api/beats/${editingTrack.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editingTrack.titulo,
          genero: editingTrack.genero,
          mood: editingTrack.mood,
        }),
      });

      if (res.ok) {
        setTracks((prev) =>
          prev.map((b) => (b.id === editingTrack.id ? { ...editingTrack } : b))
        );
        setEditingTrack(null);
        showToast('Canción actualizada con éxito.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al guardar cambios.');
    } finally {
      setLoadingId(null);
    }
  };

  // Play preview
  const handlePlayPreview = (b: TrackItem) => {
    const isCurrentPlaying = currentBeat?.id === String(b.id) && isPlaying;
    if (isCurrentPlaying) {
      pauseBeat();
    } else {
      const syntheticBeat: Beat = {
        id: String(b.id),
        title: b.titulo,
        slug: `${b.titulo.toLowerCase().replace(/\s+/g, '-')}-${b.id}`,
        type: 'musica',
        producer: {
          id: String(user.id),
          name: user.name,
          handle: user.name,
          avatar: user.image || '',
          verified: true,
          country: 'Perú',
          totalBeats: tracks.length,
        },
        genre: b.genero as any,
        bpm: b.bpm,
        key: b.nota_musical as any,
        mood: b.mood as any,
        tags: [b.genero, 'Música'],
        duration: 180,
        durationFormatted: b.duracion,
        audioPreviewUrl: b.archivo_preview,
        coverUrl: b.archivo_visual,
        waveform: Array(50).fill(0.5),
        priceFrom: 0,
        priceFromPEN: 0,
        plays: 150,
        likes: 25,
        isFree: true,
        createdAt: b.fecha_subida,
        licenses: [],
      };
      playBeat(syntheticBeat);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 rounded-2xl border border-purple-500/40 bg-zinc-950/95 p-4 text-xs font-bold text-purple-300 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-purple-950/30 via-zinc-950 to-[#09090b] pt-8 pb-10">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-purple-500/15 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-0.5 text-[10px] font-extrabold font-mono uppercase tracking-widest text-purple-400">
                  Panel de Artista
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400 font-mono">@{user.name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Mi Catálogo Musical
              </h1>
              <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                Administra tus canciones completas, demos y colaboraciones publicadas en la red de Luba Beats.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/perfil/${user.name}`}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all shadow-md"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Ver Mi Perfil</span>
              </Link>
              <Link
                href="/subir"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-[0.98]"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Publicar Nueva Canción</span>
              </Link>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Canciones</span>
                <Mic className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalTracks}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Canciones en tu biblioteca</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Lanzamientos Públicos</span>
                <Eye className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-purple-400">{publicTracks}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Disponibles en streaming</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Demos Privados</span>
                <EyeOff className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">{hiddenTracks}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Solo visibles para ti</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Streaming Global</span>
                <Radio className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">100%</div>
              <div className="text-[11px] text-zinc-500 mt-1">Acceso gratuito sin cortes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Filters and search toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center rounded-2xl bg-zinc-900/90 border border-white/10 p-1.5 shadow-inner">
            <button
              onClick={() => setFilter('todos')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'todos'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todas ({totalTracks})
            </button>
            <button
              onClick={() => setFilter('publico')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'publico'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Públicas ({publicTracks})
            </button>
            <button
              onClick={() => setFilter('oculto')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'oculto'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ocultas ({hiddenTracks})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar canción o género..."
              className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Tracks Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-black/40 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Canción</th>
                  <th className="px-4 py-3.5">Género</th>
                  <th className="px-4 py-3.5">Duración</th>
                  <th className="px-4 py-3.5">Modalidad</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTracks.length > 0 ? (
                  filteredTracks.map((b) => {
                    const isCurrentPlaying = currentBeat?.id === String(b.id) && isPlaying;
                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Artwork & Title */}
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 group/thumb">
                              <img
                                src={b.archivo_visual}
                                alt={b.titulo}
                                className="h-full w-full object-cover"
                              />
                              <button
                                onClick={() => handlePlayPreview(b)}
                                aria-label="Reproducir canción"
                                className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                              >
                                {isCurrentPlaying ? (
                                  <Pause className="h-5 w-5 fill-white" />
                                ) : (
                                  <Play className="h-5 w-5 fill-white ml-0.5" />
                                )}
                              </button>
                            </div>

                            <div className="flex flex-col">
                              <Link
                                href={`/beat/${b.id}`}
                                className="font-bold text-white hover:text-purple-400 transition-colors text-sm line-clamp-1"
                              >
                                {b.titulo}
                              </Link>
                              <span className="text-[11px] font-mono text-zinc-500">
                                {b.duracion} • Lanzamiento Oficial
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Genre */}
                        <td className="px-4 py-3.5 font-medium text-zinc-300">
                          {b.genero}
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3.5 font-mono text-cyan-400">
                          {b.duracion}
                        </td>

                        {/* Type Badge */}
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-purple-400 text-xs uppercase tracking-wider">
                            GRATIS (STREAMING)
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              b.estado === 'publico'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {b.estado === 'publico' ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            {b.estado}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Visibility */}
                            <button
                              onClick={() => handleToggleVisibility(b)}
                              disabled={loadingId === b.id}
                              title={b.estado === 'publico' ? 'Ocultar canción' : 'Hacer pública'}
                              className="rounded-lg border border-white/5 bg-black/40 p-2 text-zinc-400 hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
                            >
                              {b.estado === 'publico' ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4 text-purple-400" />
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditingTrack(b)}
                              title="Editar metadatos"
                              className="rounded-lg border border-white/5 bg-black/40 p-2 text-zinc-400 hover:border-white/20 hover:text-white transition-all"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeletingId(b.id)}
                              title="Eliminar canción"
                              className="rounded-lg border border-white/5 bg-black/40 p-2 text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No se encontraron canciones en esta categoría.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-purple-400" />
                Editar Metadatos de la Canción
              </h3>
              <button
                onClick={() => setEditingTrack(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Título de la Canción
                </label>
                <input
                  type="text"
                  required
                  value={editingTrack.titulo}
                  onChange={(e) =>
                    setEditingTrack({ ...editingTrack, titulo: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Género Musical
                </label>
                <input
                  type="text"
                  value={editingTrack.genero}
                  onChange={(e) =>
                    setEditingTrack({ ...editingTrack, genero: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTrack(null)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingId === editingTrack.id}
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-500 py-2.5 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5"
                >
                  {loadingId === editingTrack.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-zinc-950 p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¿Eliminar esta canción?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Esta acción retirará la pista permanentemente de la plataforma.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={loadingId === deletingId}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5"
              >
                {loadingId === deletingId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
