'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Disc3,
  Mic,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Play,
  Pause,
  ExternalLink,
  CheckCircle2,
  Layers,
  Crown,
} from 'lucide-react';
import { useAudioStore } from '@/store/useAudioStore';
import { Beat, defaultLicenses } from '@/types/beat';

interface UserItem {
  id: number;
  nombre_usuario: string;
  correo: string;
  tipo: string;
  foto_perfil: string | null;
  verificado_google: boolean;
  fecha_registro: string;
}

interface BeatAdminItem {
  id: number;
  titulo: string;
  tipo: string;
  genero: string;
  bpm: number;
  precio: number;
  estado: string;
  duracion: string;
  archivo_visual: string;
  archivo_preview: string;
  fecha_subida: string;
  productor: {
    id: number;
    nombre_usuario: string;
    tipo: string;
  };
}

interface Props {
  adminUser: {
    id: number;
    name: string;
    email: string;
  };
  totalUsers: number;
  users: UserItem[];
  beats: BeatAdminItem[];
}

export function AdminPanelClient({
  adminUser,
  users: initialUsers,
  beats: initialBeats,
}: Props) {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'catalogo'>('usuarios');
  const [users] = useState<UserItem[]>(initialUsers);
  const [beats, setBeats] = useState<BeatAdminItem[]>(initialBeats);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchBeats, setSearchBeats] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { currentBeat, isPlaying, playBeat, pauseBeat } = useAudioStore();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Metrics
  const productoresCount = users.filter((u) => u.tipo === 'productor').length;
  const artistasCount = users.filter((u) => u.tipo === 'artista').length;
  const compradoresCount = users.filter((u) => u.tipo === 'comprador').length;
  const totalPistas = beats.length;

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (!searchUsers.trim()) return true;
    const q = searchUsers.toLowerCase();
    return u.nombre_usuario.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
  });

  // Filtered Beats
  const filteredBeats = beats.filter((b) => {
    if (!searchBeats.trim()) return true;
    const q = searchBeats.toLowerCase();
    return (
      b.titulo.toLowerCase().includes(q) ||
      b.productor.nombre_usuario.toLowerCase().includes(q) ||
      b.genero.toLowerCase().includes(q)
    );
  });

  // Moderation: Toggle status
  const handleToggleStatus = async (beat: BeatAdminItem) => {
    const newStatus = beat.estado === 'publico' ? 'oculto' : 'publico';
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
        showToast(`Pista #${beat.id} cambiada a "${newStatus}".`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error de moderación.');
    }
  };

  // Moderation: Delete beat
  const handleDeleteBeat = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta pista de la base de datos?')) return;

    try {
      const res = await fetch(`/api/beats/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setBeats((prev) => prev.filter((b) => b.id !== id));
        showToast('Pista eliminada por administración.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al eliminar pista.');
    }
  };

  // Play preview
  const handlePlayPreview = (b: BeatAdminItem) => {
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
          id: String(b.productor.id),
          name: b.productor.nombre_usuario,
          handle: b.productor.nombre_usuario,
          avatar: '',
          verified: true,
          country: 'Perú',
          totalBeats: 1,
        },
        genre: b.genero as any,
        bpm: b.bpm,
        key: 'C Minor' as any,
        mood: 'Energético' as any,
        tags: [b.genero],
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
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 rounded-2xl border border-amber-500/40 bg-zinc-950/95 p-4 text-xs font-bold text-amber-300 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-amber-950/20 via-zinc-950 to-[#09090b] pt-8 pb-10">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 text-[10px] font-extrabold font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1">
                  <Crown className="h-3 w-3" /> Super Admin
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400 font-mono">@{adminUser.name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Control Maestro de Luba Beats
              </h1>
              <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                Supervisión global de usuarios registrados, moderación de pistas y métricas de la plataforma.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/subir"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-black text-zinc-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                <span>Subir Contenido Oficial</span>
              </Link>
            </div>
          </div>

          {/* Global Metrics Row */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Usuarios</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-black text-white">{users.length}</div>
              <div className="text-[11px] text-zinc-500 mt-1">{compradoresCount} oyentes registrados</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Productores</span>
                <Disc3 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400">{productoresCount}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Vendedores de instrumentales</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Artistas</span>
                <Mic className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-3xl font-black text-purple-400">{artistasCount}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Creadores de canciones</div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Catálogo Total</span>
                <Layers className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-400">{totalPistas}</div>
              <div className="text-[11px] text-zinc-500 mt-1">Pistas cargadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Tables */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Navigation Switcher */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'usuarios'
                ? 'bg-white text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Usuarios Registrados ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'catalogo'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Catálogo Global & Moderación ({beats.length})
          </button>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'usuarios' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <p className="text-xs text-zinc-400">
                Mostrando todos los usuarios dados de alta en la plataforma.
              </p>
              <div className="relative w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  placeholder="Buscar usuario o correo..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Usuario</th>
                      <th className="px-4 py-3.5">Correo</th>
                      <th className="px-4 py-3.5">Rol</th>
                      <th className="px-4 py-3.5">Google OAuth</th>
                      <th className="px-4 py-3.5">Fecha Registro</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Perfil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                              {u.nombre_usuario[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-white text-sm">
                              {u.nombre_usuario}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-300">{u.correo}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              u.tipo === 'super_admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : u.tipo === 'productor'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : u.tipo === 'artista'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {u.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {u.verificado_google ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Sí
                            </span>
                          ) : (
                            <span className="text-zinc-500">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-400">
                          {new Date(u.fecha_registro).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3.5 pl-4 pr-6 text-right">
                          <Link
                            href={`/perfil/${u.nombre_usuario}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <span>Ver</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Catalog Moderation */}
        {activeTab === 'catalogo' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <p className="text-xs text-zinc-400">
                Catálogo general para supervisión y moderación directa.
              </p>
              <div className="relative w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchBeats}
                  onChange={(e) => setSearchBeats(e.target.value)}
                  placeholder="Buscar pista, productor o género..."
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 bg-black/40 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3.5 pl-6 pr-3">Pista</th>
                      <th className="px-4 py-3.5">Creador</th>
                      <th className="px-4 py-3.5">Tipo</th>
                      <th className="px-4 py-3.5">Precio</th>
                      <th className="px-4 py-3.5">Estado</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBeats.map((b) => {
                      const isCurrentPlaying = currentBeat?.id === String(b.id) && isPlaying;
                      return (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 group">
                                <img
                                  src={b.archivo_visual}
                                  alt={b.titulo}
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  onClick={() => handlePlayPreview(b)}
                                  aria-label="Reproducir pista"
                                  className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {isCurrentPlaying ? (
                                    <Pause className="h-4 w-4 fill-white" />
                                  ) : (
                                    <Play className="h-4 w-4 fill-white ml-0.5" />
                                  )}
                                </button>
                              </div>
                              <div className="flex flex-col">
                                <Link
                                  href={`/beat/${b.id}`}
                                  className="font-bold text-white hover:text-amber-400 transition-colors text-sm"
                                >
                                  {b.titulo}
                                </Link>
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {b.genero} • {b.bpm} BPM
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <Link
                              href={`/perfil/${b.productor.nombre_usuario}`}
                              className="font-semibold text-zinc-300 hover:text-white"
                            >
                              @{b.productor.nombre_usuario}
                            </Link>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                b.tipo === 'beat'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-purple-500/20 text-purple-400'
                              }`}
                            >
                              {b.tipo}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 font-bold font-mono text-white">
                            ${b.precio.toFixed(2)}
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                b.estado === 'publico'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {b.estado}
                            </span>
                          </td>

                          <td className="py-3.5 pl-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(b)}
                                title={b.estado === 'publico' ? 'Ocultar' : 'Hacer público'}
                                className="rounded-lg border border-white/5 bg-black/40 p-2 text-zinc-400 hover:text-white"
                              >
                                {b.estado === 'publico' ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5 text-emerald-400" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteBeat(b.id)}
                                title="Eliminar definitivamente"
                                className="rounded-lg border border-white/5 bg-black/40 p-2 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
