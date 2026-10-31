'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  Terminal,
  Cpu,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Music2,
  Database,
  CreditCard,
  Smartphone,
  Flame,
  Edit3,
  X,
  Save,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { DeveloperProfileData } from '@/app/api/admin/developer/route';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

// Icon mapping for highlights
const highlightIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Multimedia Engine': Music2,
  'Fintech & Checkout': CreditCard,
  'Cloud & Database': Database,
  'Mobile UX': Smartphone,
};

interface Props {
  initialProfile: DeveloperProfileData;
  isSuperAdmin: boolean;
}

export function DeveloperClient({ initialProfile, isSuperAdmin }: Props) {
  const [profile, setProfile] = useState<DeveloperProfileData>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DeveloperProfileData>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/developer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
        setIsEditing(false);
        showToast('Perfil de desarrollador actualizado exitosamente.');
      } else {
        showToast(data.error || 'Error al guardar los cambios.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] pb-24 pt-8 selection:bg-purple-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 rounded-2xl border border-purple-500/40 bg-zinc-950/95 p-4 text-xs font-bold text-purple-300 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-purple-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[160px]" />
        <div className="absolute top-1/3 right-1/4 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-[180px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Admin Edit Trigger */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md hover:border-white/20 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver a Luba Beats</span>
          </Link>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <button
                onClick={handleOpenEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 text-xs font-extrabold text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 transition-all shadow-md active:scale-95"
              >
                <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                <span>Editar Información (Modo Super Admin)</span>
              </button>
            )}

            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-[11px] font-mono font-bold text-purple-300">
              <Terminal className="h-3.5 w-3.5 text-purple-400" />
              <span>developer.profile.v1</span>
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
          {/* Top banner glowing line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
            {/* Avatar / Uchiha Sigil Symbol */}
            <div className="relative group">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl p-1 bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 shadow-xl shadow-purple-900/40">
                <div className="h-full w-full rounded-[22px] bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
                  <Flame className="h-12 w-12 text-pink-500 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mt-1">
                    UCHIHA
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-zinc-950 p-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 fill-zinc-950" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {profile.name}
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  Lead Developer
                </span>
              </div>

              <p className="text-xs sm:text-sm font-mono text-purple-300">
                {profile.alias} • {profile.title}
              </p>

              <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl pt-1">
                {profile.bio}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition-all shadow-md active:scale-95"
                  >
                    <GithubIcon className="h-4 w-4" />
                    <span>GitHub: @Lucio-Magdiel</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}

                {profile.repoUrl && (
                  <a
                    href={profile.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95"
                  >
                    <Code2 className="h-4 w-4" />
                    <span>Ver Repositorio del Proyecto</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Highlights in Luba Beats */}
        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Arquitectura & Desarrollo
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                Pilares Tecnológicos de Luba Beats
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.highlights.map((h, idx) => {
              const Icon = highlightIcons[h.badge] || Code2;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 space-y-2.5 transition-all hover:border-white/20 hover:bg-zinc-900/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                      <Icon className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${h.color}`}>
                      {h.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{h.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{h.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stack & Skills Grid */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-4">
            <Cpu className="h-4 w-4" />
            <span>Tecnologías & Herramientas Dominadas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.skills.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/60 px-4 py-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-zinc-200">{s.name}</span>
                </div>
                <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/5">
                  {s.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Closing */}
        <div className="mt-10 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/20 via-zinc-900 to-cyan-950/20 p-6 text-center space-y-3">
          <h3 className="text-lg font-bold text-white">¿Tienes preguntas o deseas colaborar?</h3>
          <p className="text-xs text-zinc-400 max-w-lg mx-auto">
            Luba Beats es un proyecto activo y en constante evolución para revolucionar la industria musical en Latinoamérica.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-5 py-2.5 text-xs font-bold text-white transition-all"
            >
              <Music2 className="h-4 w-4 text-purple-400" />
              <span>Explorar el Marketplace</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Super Admin Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">
                  Editar Vista de Desarrollador
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Nombre Mostrado
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Alias / Identidad
                  </label>
                  <input
                    type="text"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Título Profesional
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Biografía
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    URL de GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    URL del Repositorio
                  </label>
                  <input
                    type="url"
                    value={formData.repoUrl}
                    onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
