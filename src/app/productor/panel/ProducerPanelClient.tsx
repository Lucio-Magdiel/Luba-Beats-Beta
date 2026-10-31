'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Disc3,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Play,
  Pause,
  DollarSign,
  Search,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { Beat, defaultLicenses } from '@/types/beat';

interface SaleItem {
  id: number;
  precio: number;
  moneda: string;
  licencia: string;
  metodo_pago: string;
  referencia_pago: string;
  estado: string;
  fecha_compra: string;
  beat_id: number;
  beat_titulo: string;
  beat_cover: string;
  comprador_nombre: string;
  comprador_correo: string;
}

interface BeatItem {
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
  initialBeats: BeatItem[];
}

export function ProducerPanelClient({ user, initialBeats }: Props) {
  const [beats, setBeats] = useState<BeatItem[]>(initialBeats);
  const [filter, setFilter] = useState<'todos' | 'publico' | 'oculto'>('todos');
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [editingBeat, setEditingBeat] = useState<BeatItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [panelTab, setPanelTab] = useState<'beats' | 'ventas'>('beats');

  const { currentBeat, isPlaying, playBeat, pauseBeat } = useAudioStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cargar ventas reales generadas para este productor
  const loadSales = async () => {
    setLoadingSales(true);
    try {
      const res = await fetch('/api/checkout');
      const d = await res.json();
      if (Array.isArray(d.sales)) {
        setSales(d.sales);
      }
    } catch (err) {
      console.warn('No se pudieron cargar ventas:', err);
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // Metrics
  const totalBeats = beats.length;
  const publicBeats = beats.filter((b) => b.estado === 'publico').length;
  const hiddenBeats = beats.filter((b) => b.estado === 'oculto' || b.estado === 'privado').length;
  const totalSalesUSD = sales.reduce((acc, curr) => acc + (Number(curr.precio) || 0), 0);

  // Filtered beats
  const filteredBeats = beats.filter((b) => {
    if (filter === 'publico' && b.estado !== 'publico') return false;
    if (filter === 'oculto' && b.estado === 'publico') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.titulo.toLowerCase().includes(q) ||
        b.genero.toLowerCase().includes(q) ||
        b.nota_musical.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Toggle Visibility (publico <-> oculto)
  const handleToggleVisibility = async (beat: BeatItem) => {
    const newStatus = beat.estado === 'publico' ? 'oculto' : 'publico';
    setLoadingId(beat.id);

    try {
      const res = await fetch(`/api/beats/${beat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (res.ok) {
        setBeats((prev) =>
          prev.map((b) => (b.id === beat.id ? { ...b, estado: newStatus } : b))
        );
        showToast(
          newStatus === 'publico'
            ? `"${beat.titulo}" ahora es visible en el catálogo.`
            : `"${beat.titulo}" fue ocultado del catálogo.`
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Error al cambiar visibilidad.');
    } finally {
      setLoadingId(null);
    }
  };

  // Delete Beat
  const handleDelete = async (id: number) => {
    setLoadingId(id);

    try {
      const res = await fetch(`/api/beats/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBeats((prev) => prev.filter((b) => b.id !== id));
        setDeletingId(null);
        showToast('Pista eliminada de la plataforma.');
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
    if (!editingBeat) return;

    setLoadingId(editingBeat.id);

    try {
      const res = await fetch(`/api/beats/${editingBeat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editingBeat.titulo,
          precio: editingBeat.precio,
          bpm: editingBeat.bpm,
          genero: editingBeat.genero,
          nota_musical: editingBeat.nota_musical,
        }),
      });

      if (res.ok) {
        setBeats((prev) =>
          prev.map((b) => (b.id === editingBeat.id ? { ...editingBeat } : b))
        );
        setEditingBeat(null);
        showToast('Metadatos actualizados con éxito.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al guardar cambios.');
    } finally {
      setLoadingId(null);
    }
  };

  // Play preview in table
  const handlePlayPreview = (b: BeatItem) => {
    const isCurrentPlaying = currentBeat?.id === String(b.id) && isPlaying;
    if (isCurrentPlaying) {
      pauseBeat();
    } else {
      const syntheticBeat: Beat = {
        id: String(b.id),
        title: b.titulo,
        slug: `${b.titulo.toLowerCase().replace(/\s+/g, '-')}-${b.id}`,
        type: b.tipo as any,
        producer: {
          id: String(user.id),
          name: user.name,
          handle: user.name,
          avatar: user.image || '',
          verified: true,
          country: 'Perú',
          totalBeats: beats.length,
        },
        genre: b.genero as any,
        bpm: b.bpm,
        key: b.nota_musical as any,
        mood: b.mood as any,
        tags: [b.genero, `${b.bpm} BPM`],
        duration: 180,
        durationFormatted: b.duracion,
        audioPreviewUrl: b.archivo_preview,
        coverUrl: b.archivo_visual,
        waveform: Array(50).fill(0.5),
        priceFrom: b.precio,
        priceFromPEN: Math.round(b.precio * 3.75),
        plays: 100,
        likes: 10,
        createdAt: b.fecha_subida,
        licenses: b.tipo === 'beat' && b.precio > 0 ? defaultLicenses(b.precio) : [],
      };
      playBeat(syntheticBeat);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 rounded-2xl border border-emerald-500/40 bg-zinc-950/95 p-4 text-xs font-bold text-emerald-300 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-zinc-900 via-zinc-950 to-[#09090b] pt-8 pb-10">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-extrabold font-mono uppercase tracking-widest text-emerald-400">
                  Panel de Control Oficial
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400 font-mono">@{user.name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Estudio del Productor
              </h1>
              <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                Monitorea el inventario de tus instrumentales, cambia visibilidad en tiempo real y gestiona tus precios oficiales.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/perfil/${user.name}`}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all shadow-md"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Ver Mi Perfil Público</span>
              </Link>
              <Link
                href="/subir"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-[0.98]"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Subir Nuevo Beat</span>
              </Link>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Pistas</span>
                <Disc3 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">{totalBeats}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Instrumentales subidas</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Públicos</span>
                <Eye className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">{publicBeats}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Visibles en el catálogo general</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Ocultos</span>
                <EyeOff className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">{hiddenBeats}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Guardados en tu biblioteca privada</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Ventas Reales</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">
                ${totalSalesUSD.toFixed(2)} <span className="text-xs font-mono text-zinc-500">USD</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">{sales.length} licencias vendidas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Navigation Switcher between Beats and Sales */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <button
            onClick={() => setPanelTab('beats')}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              panelTab === 'beats'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mis Instrumentales ({beats.length})
          </button>
          <button
            onClick={() => setPanelTab('ventas')}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              panelTab === 'ventas'
                ? 'bg-white text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Historial de Ventas e Ingresos ({sales.length})
          </button>
        </div>
        
        {panelTab === 'beats' ? (
          <>
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
                  Todos ({totalBeats})
                </button>
                <button
                  onClick={() => setFilter('publico')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    filter === 'publico'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Públicos ({publicBeats})
                </button>
                <button
                  onClick={() => setFilter('oculto')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    filter === 'oculto'
                      ? 'bg-amber-500 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Ocultos ({hiddenBeats})
                </button>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título, BPM o tonalidad..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Beats Inventory Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Pista</th>
                      <th className="px-4 py-3.5">Género / BPM</th>
                      <th className="px-4 py-3.5">Tonalidad</th>
                      <th className="px-4 py-3.5">Precio Base</th>
                      <th className="px-4 py-3.5">Estado</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBeats.length > 0 ? (
                      filteredBeats.map((b) => {
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
                                    aria-label="Reproducir pista"
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
                                    className="font-bold text-white hover:text-emerald-400 transition-colors text-sm line-clamp-1"
                                  >
                                    {b.titulo}
                                  </Link>
                                  <span className="text-[11px] font-mono text-zinc-500">
                                    {b.duracion} • {b.tipo}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Genre & BPM */}
                            <td className="px-4 py-3.5">
                              <div className="flex flex-col">
                                <span className="font-medium text-zinc-300">{b.genero}</span>
                                <span className="font-mono text-cyan-400 text-[11px]">{b.bpm} BPM</span>
                              </div>
                            </td>

                            {/* Key */}
                            <td className="px-4 py-3.5 font-mono text-indigo-300">
                              {b.nota_musical}
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-emerald-400 text-sm">
                                ${b.precio.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono block">
                                S/ {(b.precio * 3.75).toFixed(2)}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                  b.estado === 'publico'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
                                  title={b.estado === 'publico' ? 'Ocultar beat' : 'Publicar beat'}
                                  className="rounded-lg border border-white/5 bg-black/40 p-2 text-zinc-400 hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
                                >
                                  {b.estado === 'publico' ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-emerald-400" />
                                  )}
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => setEditingBeat(b)}
                                  title="Editar metadatos"
                                  className="rounded-lg border border-white/5 bg-black/40 p-2 text-zinc-400 hover:border-white/20 hover:text-white transition-all"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => setDeletingId(b.id)}
                                  title="Eliminar beat"
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
                          No se encontraron instrumentales en esta categoría.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Sales Section Header & Live Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900/60 border border-white/5 p-4 rounded-2xl backdrop-blur-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  Registro de Transacciones y Licencias
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualiza las ventas generadas y los artistas que adquirieron tus instrumentales.
                </p>
              </div>

              <button
                onClick={loadSales}
                disabled={loadingSales}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-zinc-800/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`h-3.5 w-3.5 text-emerald-400 ${loadingSales ? 'animate-spin' : ''}`} />
                <span>{loadingSales ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </div>

            {/* Sales History Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Beat Vendido</th>
                      <th className="px-4 py-3.5">Comprador</th>
                      <th className="px-4 py-3.5">Licencia</th>
                      <th className="px-4 py-3.5">Total Recibido</th>
                      <th className="px-4 py-3.5">Método / Ref</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sales.length > 0 ? (
                      sales.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={s.beat_cover}
                                alt={s.beat_titulo}
                                className="h-10 w-10 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-sm line-clamp-1">
                                  {s.beat_titulo}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  ID #{s.beat_id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-200">{s.comprador_nombre}</span>
                              <span className="text-[11px] font-mono text-zinc-500">{s.comprador_correo}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {s.licencia}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-emerald-400 text-sm">
                              ${s.precio.toFixed(2)} {s.moneda}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-300 capitalize">{s.metodo_pago}</span>
                              <span className="font-mono text-[10px] text-zinc-500">{s.referencia_pago}</span>
                            </div>
                          </td>
                          <td className="py-3.5 pl-4 pr-6 text-right font-mono text-[11px] text-zinc-400">
                            {new Date(s.fecha_compra).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-zinc-500">
                          <ShoppingBag className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
                          <p className="text-sm font-semibold text-zinc-400">Aún no registras ventas en tu cuenta</p>
                          <p className="text-xs text-zinc-600 mt-1">
                            Cuando los artistas adquieran licencias de tus instrumentales, los ingresos y detalles aparecerán aquí en tiempo real.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingBeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-emerald-400" />
                Editar Metadatos del Beat
              </h3>
              <button
                onClick={() => setEditingBeat(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={editingBeat.titulo}
                  onChange={(e) =>
                    setEditingBeat({ ...editingBeat, titulo: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Precio ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingBeat.precio}
                    onChange={(e) =>
                      setEditingBeat({
                        ...editingBeat,
                        precio: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    BPM
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    required
                    value={editingBeat.bpm}
                    onChange={(e) =>
                      setEditingBeat({
                        ...editingBeat,
                        bpm: parseInt(e.target.value, 10) || 140,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Género
                  </label>
                  <input
                    type="text"
                    value={editingBeat.genero}
                    onChange={(e) =>
                      setEditingBeat({ ...editingBeat, genero: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">
                    Tonalidad
                  </label>
                  <input
                    type="text"
                    value={editingBeat.nota_musical}
                    onChange={(e) =>
                      setEditingBeat({ ...editingBeat, nota_musical: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBeat(null)}
                  className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingId === editingBeat.id}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 shadow-md flex items-center justify-center gap-1.5"
                >
                  {loadingId === editingBeat.id ? (
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
              <h3 className="text-base font-bold text-white">¿Eliminar este beat?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Esta acción retirará la pista permanentemente de la base de datos y ya no estará disponible para compra.
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
