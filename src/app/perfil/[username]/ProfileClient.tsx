'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  CheckCircle2,
  Disc3,
  Mic,
  Share2,
  UploadCloud,
  ArrowLeft,
  Calendar,
  MapPin,
  Music2,
  Layers,
  Search,
  UserPlus,
  UserCheck,
  MessageSquare,
  Send,
  Loader2,
  Users,
  X,
  ExternalLink,
  Edit3,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  Info,
  Crown,
} from 'lucide-react';
import { UserProfileData } from '@/lib/getProfile';
import { BeatCard } from '@/components/beats/BeatCard';

interface Props {
  profile: UserProfileData;
}

export function ProfileClient({ profile }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [tab, setTab] = useState<'todos' | 'beat' | 'musica'>('todos');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  // Dynamic Profile Data State
  const [currentUsername, setCurrentUsername] = useState(profile.nombre_usuario);
  const [currentBio, setCurrentBio] = useState(profile.bio || '');
  const [currentAvatar, setCurrentAvatar] = useState(profile.foto_perfil || '');
  const [currentBanner, setCurrentBanner] = useState(profile.banner || '');
  const [cambiosUsuario, setCambiosUsuario] = useState(profile.cambios_usuario || 0);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(profile.nombre_usuario);
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile.followersCount);
  const [followLoading, setFollowLoading] = useState(false);

  // Message State
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openEditModal = () => {
    setEditUsername(currentUsername);
    setEditBio(currentBio);
    setAvatarFile(null);
    setAvatarPreview(null);
    setBannerFile(null);
    setBannerPreview(null);
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setEditError('Por favor selecciona una imagen válida (JPG, PNG o WebP).');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setEditError('La foto de perfil no debe superar los 4MB para subida rápida.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setEditError(null);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setEditError('Por favor selecciona una imagen válida (JPG, PNG o WebP).');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setEditError('La imagen de portada / banner no debe superar los 4MB para subida rápida.');
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
      setEditError(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    try {
      const fd = new FormData();
      const trimmedUsername = editUsername.trim();

      if (trimmedUsername !== currentUsername) {
        if (cambiosUsuario >= 3) {
          setEditError('Has alcanzado el límite de 3 cambios permitidos de nombre de usuario.');
          setEditLoading(false);
          return;
        }
        if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(trimmedUsername)) {
          setEditError('El nombre debe tener entre 3 y 30 caracteres (letras mayúsculas, minúsculas, números o guiones).');
          setEditLoading(false);
          return;
        }
        fd.append('nombre_usuario', trimmedUsername);
      }

      if (editBio !== currentBio) {
        fd.append('bio', editBio.trim());
      }
      if (avatarFile) {
        fd.append('avatar', avatarFile);
      }
      if (bannerFile) {
        fd.append('banner', bannerFile);
      }

      const res = await fetch('/api/users/profile', {
        method: 'POST',
        body: fd,
      });

      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        if (res.status === 413 || rawText.includes('Request Entity Too Large')) {
          setEditError('Las imágenes seleccionadas superan el límite permitido (4MB). Por favor elige una imagen más ligera.');
          return;
        }
        setEditError(`Error en el servidor (${res.status}): ${rawText.slice(0, 100)}`);
        return;
      }

      if (!res.ok) {
        setEditError(data.error || 'Ocurrió un error al actualizar el perfil.');
        return;
      }

      if (data.user) {
        const oldUsername = currentUsername;
        setCurrentUsername(data.user.nombre_usuario);
        if (data.user.foto_perfil) setCurrentAvatar(data.user.foto_perfil);
        if (data.user.banner) setCurrentBanner(data.user.banner);
        setCurrentBio(data.user.bio || '');
        if (typeof data.user.cambios_usuario === 'number') {
          setCambiosUsuario(data.user.cambios_usuario);
        }

        showToast(data.message || 'Perfil actualizado exitosamente.');
        setIsEditModalOpen(false);

        if (data.user.nombre_usuario !== oldUsername) {
          router.replace(`/perfil/${encodeURIComponent(data.user.nombre_usuario)}`);
        }
      }
    } catch (err) {
      console.error(err);
      setEditError('Error de conexión al guardar los cambios.');
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/users/${profile.id}/follow`)
      .then((r) => r.json())
      .then((d) => {
        if (d.isFollowing !== undefined) {
          setIsFollowing(d.isFollowing);
          setFollowersCount(d.followersCount);
        }
      })
      .catch(console.error);
  }, [profile.id, session?.user]);

  const handleFollowToggle = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=/perfil/${profile.nombre_usuario}`);
      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${profile.id}/follow`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
        showToast(data.message);
      } else {
        showToast(data.error || 'No se pudo actualizar el seguimiento.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push(`/login?callbackUrl=/perfil/${profile.nombre_usuario}`);
      return;
    }

    if (!messageText.trim()) return;

    setMessageSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_receptor: profile.id,
          contenido: messageText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessageText('');
        setIsMessageModalOpen(false);
        showToast(`Mensaje enviado exitosamente a @${profile.nombre_usuario}`);
      } else {
        showToast(data.error || 'Error al enviar mensaje');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al enviar mensaje');
    } finally {
      setMessageSending(false);
    }
  };

  const sessionUserId = (session?.user as any)?.id;
  const isOwner = Boolean(
    (sessionUserId && String(sessionUserId) === String(profile.id)) ||
    session?.user?.name === currentUsername ||
    (session?.user as any)?.nombre_usuario === currentUsername
  );

  const isSuperAdmin = profile.tipo === 'super_admin';
  const isProductor = profile.tipo === 'productor';
  const isArtista = profile.tipo === 'artista';
  const sessionUserRole = (session?.user as any)?.role;
  const canUpload =
    (sessionUserRole === 'productor' || sessionUserRole === 'artista' || sessionUserRole === 'super_admin') &&
    profile.tipo !== 'comprador';

  const beatsOnly = profile.beats.filter((b) => b.type === 'beat');
  const musicaOnly = profile.beats.filter((b) => b.type === 'musica');

  const filteredBeats = profile.beats.filter((b) => {
    if (tab === 'beat' && b.type !== 'beat') return false;
    if (tab === 'musica' && b.type !== 'musica') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q) ||
        b.key.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const defaultBanner =
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&auto=format&fit=crop&q=80';
  const bannerUrl = currentBanner || defaultBanner;

  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
  const avatarUrl = currentAvatar || defaultAvatar;

  const formattedDate = new Date(profile.fecha_registro).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-32">
      {/* Banner Section */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-zinc-950">
        <img
          src={bannerUrl}
          alt={`Banner de ${currentUsername}`}
          className="h-full w-full object-cover object-center opacity-60 filter blur-[0.5px]"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/80 via-transparent to-[#09090b]/80" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            href="/#catalogo"
            className="inline-flex items-center gap-2 rounded-xl bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-md border border-white/10 hover:border-white/30 hover:text-white transition-all group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>

        {/* Edit Banner Button (if owner) */}
        {isOwner && (
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-10">
            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex items-center gap-2 rounded-xl bg-black/70 px-3.5 py-2 text-xs font-bold text-zinc-200 backdrop-blur-md border border-white/15 hover:border-emerald-500/50 hover:text-white hover:bg-black/90 transition-all shadow-lg active:scale-95 group cursor-pointer"
            >
              <Camera className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Cambiar Portada</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-20">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-purple-950/20">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Avatar with Glow Ring */}
              <div className="relative group/avatar">
                <div
                  className={`h-28 w-28 sm:h-36 sm:w-36 rounded-3xl overflow-hidden p-1 shadow-2xl relative ${
                    isSuperAdmin
                      ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-amber-500/20'
                      : isProductor
                      ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400'
                      : isArtista
                      ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-500'
                      : 'bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500'
                  }`}
                >
                  <img
                    src={avatarUrl}
                    alt={currentUsername}
                    className="h-full w-full object-cover rounded-[22px] bg-zinc-950"
                  />

                  {isOwner && (
                    <button
                      type="button"
                      onClick={openEditModal}
                      title="Cambiar foto de perfil"
                      className="absolute inset-1 rounded-[22px] bg-black/65 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-1.5 text-white text-xs font-bold transition-all backdrop-blur-[2px] cursor-pointer"
                    >
                      <Camera className="h-5 w-5 text-emerald-400 animate-pulse" />
                      <span className="text-[11px] tracking-wide">Editar Foto</span>
                    </button>
                  )}
                </div>
                {profile.verificado_google && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-zinc-950 p-1">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 fill-zinc-950" />
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    {currentUsername}
                  </h1>
                  
                  {/* Role Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      isSuperAdmin
                        ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : isProductor
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isArtista
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {isSuperAdmin ? (
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                    ) : isProductor ? (
                      <Disc3 className="h-3.5 w-3.5" />
                    ) : (
                      <Mic className="h-3.5 w-3.5" />
                    )}
                    {isSuperAdmin ? 'Super Admin / Lead Dev' : profile.tipo}
                  </span>
                </div>

                <p className="text-sm font-mono text-zinc-400">
                  @{currentUsername}
                </p>

                {/* Bio */}
                <p className="text-sm text-zinc-300 max-w-xl leading-relaxed pt-1">
                  {currentBio ||
                    (isProductor
                      ? 'Productor musical en Luba Beats creando instrumentales de alta calidad con licencias comerciales inmediatas.'
                      : isArtista
                      ? 'Artista musical en Luba Beats compartiendo singles y proyectos sonoros.'
                      : 'Miembro de la comunidad de Luba Beats.')}
                </p>

                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 pt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" /> Perú / Latinoamérica
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" /> Miembro desde {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
              {/* Follow Button (if not owner) */}
              {!isOwner && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                    isFollowing
                      ? 'bg-zinc-800 border border-white/20 text-zinc-200 hover:bg-zinc-700 hover:border-red-500/40 hover:text-red-300'
                      : isProductor
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                  }`}
                >
                  {followLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}

              {/* Send Message Button (if not owner) */}
              {!isOwner && (
                <button
                  onClick={() => setIsMessageModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400/50 transition-all shadow-md active:scale-95"
                >
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                  <span>Mensaje</span>
                </button>
              )}

              {/* Lead Developer Portfolio link if Super Admin */}
              {isSuperAdmin && (
                <Link
                  href="/desarrollador"
                  className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-950/60 to-pink-950/40 hover:from-purple-900/70 hover:to-pink-900/50 px-4 py-2.5 text-xs font-bold text-purple-200 hover:text-white hover:border-purple-400 transition-all shadow-md group"
                >
                  <Crown className="h-4 w-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span>Portafolio Lead Dev</span>
                </Link>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all shadow-md"
              >
                <Share2 className="h-4 w-4" />
                <span>{copied ? '¡Enlace Copiado!' : 'Compartir'}</span>
              </button>

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4 text-emerald-400" />
                    <span>Editar Perfil</span>
                  </button>

                  <Link
                    href="/mensajes"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:bg-white/10 transition-all shadow-md"
                  >
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                    <span>Mis Mensajes</span>
                  </Link>

                  {canUpload && (
                    <Link
                      href="/subir"
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition-all"
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>Subir Pista</span>
                    </Link>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Quick Metrics Bar with Followers and Following */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/5 pt-6">
            <div className="rounded-2xl bg-black/30 border border-white/5 p-3.5 text-center">
              <div className="text-2xl font-black text-white">{profile.beats.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                Total Pistas
              </div>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/5 p-3.5 text-center">
              <div className="text-2xl font-black text-emerald-400">{beatsOnly.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                Beats en Venta
              </div>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/5 p-3.5 text-center">
              <div className="text-2xl font-black text-purple-400">{followersCount}</div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
                <Users className="h-3 w-3" /> Seguidores
              </div>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/5 p-3.5 text-center">
              <div className="text-2xl font-black text-cyan-400">{profile.followingCount}</div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                Siguiendo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog & Filter Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-5">
          {/* Segmented Filter Switcher */}
          <div className="flex items-center rounded-2xl bg-zinc-900/90 border border-white/10 p-1.5 shadow-inner">
            <button
              onClick={() => setTab('todos')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                tab === 'todos'
                  ? 'bg-white text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Todo ({profile.beats.length})</span>
            </button>

            <button
              onClick={() => setTab('beat')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                tab === 'beat'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Disc3 className="h-3.5 w-3.5" />
              <span>Beats ({beatsOnly.length})</span>
            </button>

            <button
              onClick={() => setTab('musica')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                tab === 'musica'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Música ({musicaOnly.length})</span>
            </button>
          </div>

          {/* Search inside producer catalog */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en este perfil..."
              className="w-full rounded-xl border border-white/10 bg-zinc-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Tracks Grid */}
        {filteredBeats.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBeats.map((beat) => (
              <BeatCard key={beat.id} beat={beat} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="mt-16 rounded-3xl border border-dashed border-white/10 p-12 text-center max-w-lg mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 mb-4 border border-white/5">
              <Music2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No se encontraron pistas</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              {search
                ? `No hay coincidencias para "${search}". Prueba con otro término.`
                : 'Este creador aún no tiene pistas públicas en esta categoría.'}
            </p>
            {isOwner && canUpload && (
              <div className="mt-6">
                <Link
                  href="/subir"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Subir tu Primera Pista</span>
                </Link>
              </div>
            )}
            {isOwner && !canUpload && (
              <div className="mt-6">
                <Link
                  href="/#catalogo"
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition-all"
                >
                  <Music2 className="h-4 w-4" />
                  <span>Explorar Instrumentales en el Catálogo</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 rounded-2xl border border-white/20 bg-zinc-950/95 p-4 text-xs font-bold text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Send Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={profile.nombre_usuario}
                  className="h-10 w-10 rounded-xl object-cover ring-1 ring-purple-500/40"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Enviar Mensaje a @{profile.nombre_usuario}
                  </h3>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Mensajería directa y privada
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMessageModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">
                  Tu Mensaje
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Hola @${profile.nombre_usuario}, me interesa tu trabajo y quisiera consultarte sobre...`}
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Link
                  href={`/mensajes?con=${profile.nombre_usuario}`}
                  onClick={() => setIsMessageModalOpen(false)}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                >
                  <span>Abrir en Chat Completo</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsMessageModalOpen(false)}
                    className="flex-1 sm:flex-none rounded-xl border border-white/10 py-2.5 px-4 text-xs font-bold text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={messageSending || !messageText.trim()}
                    className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 py-2.5 px-5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {messageSending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Enviar Mensaje</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-6 flex justify-center items-start sm:items-center animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl shadow-emerald-950/20 my-auto overflow-hidden">
            {/* Modal Header (Fixed) */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-white/10 shrink-0 bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Editar Perfil</h3>
                  <p className="text-xs text-zinc-400">Personaliza tu portada, foto, nombre artístico y biografía</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProfile} id="edit-profile-form" className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Banner Upload Preview */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Imagen de Portada / Banner
                </label>
                <div className="relative h-28 sm:h-32 w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 group">
                  <img
                    src={bannerPreview || bannerUrl}
                    alt="Preview Portada"
                    className="h-full w-full object-cover opacity-75 group-hover:opacity-60 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/75 border border-white/20 text-xs font-semibold text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all shadow-md cursor-pointer"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>{bannerFile ? 'Cambiar Imagen Elegida' : 'Subir Nueva Portada'}</span>
                    </button>
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">Recomendado: 1600x400 píxeles. Máx 15MB (JPG, PNG, WebP).</p>
              </div>

              {/* Avatar Upload Preview */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Foto de Perfil (Avatar)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-zinc-900 shadow-md">
                    <img
                      src={avatarPreview || avatarUrl}
                      alt="Preview Foto de Perfil"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-emerald-600 border border-white/15 hover:border-emerald-500 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                    >
                      <Camera className="h-4 w-4 text-emerald-400 group-hover:text-white" />
                      <span>{avatarFile ? 'Foto Seleccionada (Cambiar)' : 'Seleccionar Foto'}</span>
                    </button>
                    <p className="text-[11px] text-zinc-400 mt-2">Formatos admitidos: JPG, PNG o WebP. Máximo 10MB.</p>
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* Nombre de Usuario o Artista (Límite 3 cambios) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Nombre de Usuario o Artista
                  </label>
                  {/* Badge de cambios restantes */}
                  {cambiosUsuario < 3 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      <Info className="h-3 w-3" />
                      {3 - cambiosUsuario} de 3 cambios restantes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      <AlertTriangle className="h-3 w-3" />
                      Límite alcanzado (3/3)
                    </span>
                  )}
                </div>

                {/* Input group with clear separate @ badge to avoid any text overlap */}
                <div
                  className={`flex items-center rounded-2xl border transition-all overflow-hidden ${
                    cambiosUsuario >= 3
                      ? 'border-zinc-800 bg-zinc-900/40 text-zinc-500'
                      : 'border-white/10 bg-zinc-900/90 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500'
                  }`}
                >
                  <div className="px-3.5 py-3 bg-zinc-800/80 border-r border-white/10 text-zinc-400 font-mono font-bold text-sm select-none shrink-0 flex items-center justify-center">
                    @
                  </div>
                  <input
                    type="text"
                    value={editUsername}
                    disabled={cambiosUsuario >= 3}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^a-zA-Z0-9_.-]/g, '');
                      setEditUsername(sanitized);
                    }}
                    placeholder="Metro_Boomin"
                    className={`w-full bg-transparent py-3 px-3.5 text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none ${
                      cambiosUsuario >= 3 ? 'cursor-not-allowed text-zinc-500' : ''
                    }`}
                  />
                </div>

                {cambiosUsuario >= 3 ? (
                  <p className="text-[11px] text-amber-400/90 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Has alcanzado el límite máximo de 3 cambios de nombre de usuario en esta cuenta.
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-400 mt-1.5">
                    Puedes usar letras Mayúsculas, minúsculas, números y guiones. Si lo cambias, tu perfil público será{' '}
                    <span className="text-zinc-200 font-mono">/perfil/{editUsername || 'tu_nombre'}</span> y se descontará 1 cambio.
                  </p>
                )}
              </div>

              {/* Biografía */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Biografía / Descripción
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {editBio.length} / 500
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Escribe tu biografía, créditos musicales, colaboraciones o equipos con los que trabajas..."
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900/90 p-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Error Alert */}
              {editError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{editError}</span>
                </div>
              )}
            </form>

            {/* Modal Footer (Sticky) */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-white/10 bg-zinc-900/60 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={editLoading}
                className="rounded-xl border border-white/10 py-2.5 px-4 text-xs font-bold text-zinc-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="edit-profile-form"
                disabled={editLoading}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 px-6 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98] cursor-pointer"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Guardando Cambios...</span>
                  </>
                ) : (
                  <span>Guardar Cambios</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
