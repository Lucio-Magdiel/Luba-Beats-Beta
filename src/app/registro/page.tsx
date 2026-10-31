"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Music2,
  Lock,
  Mail,
  User,
  Headphones,
  Mic,
  Disc3,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
  Sparkles,
  Shield,
  X,
  Scale,
} from "lucide-react";

type RoleType = "comprador" | "productor" | "artista";

export default function RegisterPage() {
  const router = useRouter();

  // Wizard Step: 1 = Credenciales, 2 = Elección de Rol
  const [step, setStep] = useState<1 | 2>(1);

  const [tipo, setTipo] = useState<RoleType>("comprador");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [aceptaReglas, setAceptaReglas] = useState(false);
  const [mostrarReglasModal, setMostrarReglasModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(contrasena);

  // Validación de Paso 1 antes de pasar al Paso 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = nombreUsuario.trim();
    if (cleanUser.length < 3 || cleanUser.length > 30) {
      setError("El nombre de usuario o artista debe tener entre 3 y 30 caracteres.");
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUser)) {
      setError("El nombre de usuario o artista solo puede contener letras, números, puntos y guiones.");
      return;
    }

    const cleanEmail = correo.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setStep(2);
  };

  // Envío final del formulario en Paso 2
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!aceptaReglas) {
      setError("Debes leer y aceptar las Reglas de la Comunidad y Términos de Servicio para registrarte.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_usuario: nombreUsuario.trim(),
          correo: correo.trim().toLowerCase(),
          contrasena,
          tipo,
          acepta_reglas: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo completar el registro.");
        // Si el error es de usuario o correo, regresamos al paso 1 para que lo corrija
        if (data.error && (data.error.includes("usuario") || data.error.includes("correo"))) {
          setStep(1);
        }
        setLoading(false);
        return;
      }

      // Auto-login tras registro exitoso
      const loginRes = await signIn("credentials", {
        identificador: correo,
        password: contrasena,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Error al comunicarse con el servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#09090b] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#0d0d12] rounded-[10px] flex items-center justify-center">
                <Music2 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl tracking-wider text-white">LUBA</span>
                <span className="font-bold text-xl tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  BEATS
                </span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
                Crear Nueva Cuenta
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Únete a la Comunidad</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            {step === 1
              ? "Ingresa tus datos de acceso para comenzar a formar parte del ecosistema musical."
              : "Selecciona el perfil que mejor se adapta a tus objetivos en la plataforma."}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              step === 1
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
              1
            </span>
            <span>Tus Datos</span>
          </div>

          <div className="h-0.5 w-6 bg-white/10" />

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              step === 2
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "bg-zinc-900 border border-white/10 text-zinc-500"
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
              2
            </span>
            <span>Elige tu Rol</span>
          </div>
        </div>

        {/* Main Glass Card */}
        <div className="relative rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl shadow-purple-950/30 overflow-hidden">
          {/* Ambient Top Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* PASO 1: Formulario de Datos */}
          {step === 1 && (
            <form onSubmit={handleProceedToStep2} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Nombre de Usuario o Artista
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nombreUsuario}
                    onChange={(e) =>
                      setNombreUsuario(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ""))
                    }
                    placeholder="ej. Metro_Boomin"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Tu perfil público será: beats.luba-home.online/perfil/{nombreUsuario || "Tu_Nombre"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmarContrasena}
                      onChange={(e) => setConfirmarContrasena(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password strength meter */}
              {contrasena && (
                <div className="space-y-1">
                  <div className="flex gap-1 h-1.5 w-full">
                    <div
                      className={`h-full rounded-full flex-1 transition-all ${
                        strength >= 1 ? "bg-red-500" : "bg-zinc-800"
                      }`}
                    />
                    <div
                      className={`h-full rounded-full flex-1 transition-all ${
                        strength >= 2 ? "bg-amber-500" : "bg-zinc-800"
                      }`}
                    />
                    <div
                      className={`h-full rounded-full flex-1 transition-all ${
                        strength >= 3 ? "bg-emerald-500" : "bg-zinc-800"
                      }`}
                    />
                    <div
                      className={`h-full rounded-full flex-1 transition-all ${
                        strength >= 4 ? "bg-cyan-400" : "bg-zinc-800"
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                    {strength < 2 ? (
                      <span>Contraseña básica</span>
                    ) : strength < 4 ? (
                      <span>Contraseña segura</span>
                    ) : (
                      <span className="text-cyan-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Contraseña ultra segura
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Informative Rules Pill */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
                <Scale className="h-4 w-4 shrink-0 text-purple-400" />
                <span className="leading-snug">
                  Plataforma <strong>100% musical con Sistema de 3 Vidas (Strikes)</strong>. Prohibido subir audios que no sean música, spam o contenido ajeno.
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-5 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 text-xs sm:text-sm"
              >
                <span>Siguiente: Elegir Rol</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* PASO 2: Selección de Rol Detallada */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
              <div className="text-left mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold block mb-1">
                  Paso 2 de 2 • Personaliza tu experiencia
                </span>
                <h3 className="text-base font-bold text-white">
                  ¿Cuál es tu rol principal en la plataforma?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Elige cómo deseas participar. Podrás actualizar o explorar otras funciones más adelante.
                </p>
              </div>

              {/* Cards de Rol con Descripciones Claras */}
              <div className="space-y-3">
                {/* 1. Oyente (comprador) */}
                <div
                  onClick={() => setTipo("comprador")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    tipo === "comprador"
                      ? "bg-purple-600/15 border-purple-500 shadow-xl shadow-purple-600/20 ring-1 ring-purple-500"
                      : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-xl shrink-0 transition-colors ${
                        tipo === "comprador"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                          : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                      }`}
                    >
                      <Headphones className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">Oyente</h4>
                          <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 rounded-full">
                            Poder escuchar y comprar
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            tipo === "comprador"
                              ? "border-purple-500 bg-purple-600 text-white"
                              : "border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {tipo === "comprador" && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        Diseñado para amantes de la música, creadores de contenido y compradores. Podrás reproducir todas las pistas sin anuncios, comprar licencias de instrumentales, guardar tus beats favoritos y gestionar tus compras.
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          🎧 Streaming continuo
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          💳 Compra de licencias
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          📜 Contratos legales
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Artista */}
                <div
                  onClick={() => setTipo("artista")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    tipo === "artista"
                      ? "bg-cyan-600/15 border-cyan-500 shadow-xl shadow-cyan-600/20 ring-1 ring-cyan-500"
                      : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-xl shrink-0 transition-colors ${
                        tipo === "artista"
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                          : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                      }`}
                    >
                      <Mic className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">Artista</h4>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                            Poder compartir tu música, igual escuchar y comprar
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            tipo === "artista"
                              ? "border-cyan-500 bg-cyan-600 text-white"
                              : "border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {tipo === "artista" && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        Para cantantes, raperos y compositores. Podrás compartir tus temas y demos con la comunidad, adquirir instrumentales de productores verificados y gestionar tus lanzamientos desde tu propio Panel de Artista.
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          🎤 Compartir temas & demos
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          🛒 Comprar licencias
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          📊 Panel de Artista
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Productor */}
                <div
                  onClick={() => setTipo("productor")}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    tipo === "productor"
                      ? "bg-emerald-600/15 border-emerald-500 shadow-xl shadow-emerald-600/20 ring-1 ring-emerald-500"
                      : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-xl shrink-0 transition-colors ${
                        tipo === "productor"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "bg-zinc-800 text-zinc-400 group-hover:text-white"
                      }`}
                    >
                      <Disc3 className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">Productor</h4>
                          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            Poder subir tus beats y poder venderlos
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            tipo === "productor"
                              ? "border-emerald-500 bg-emerald-600 text-white"
                              : "border-zinc-700 bg-zinc-900"
                          }`}
                        >
                          {tipo === "productor" && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        Para beatmakers y productores musicales. Publica tus instrumentales con licencias protegidas, define precios de venta comercial y recibe ganancias directas por Yape, Plin y tarjetas de crédito.
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          🎹 Subir & Vender beats
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          📱 Cobros con Yape & Plin
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-300">
                          📈 Panel de Ventas & Ganancias
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reglas de la Comunidad y Términos de Servicio */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acepta-reglas"
                    checked={aceptaReglas}
                    onChange={(e) => setAceptaReglas(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-zinc-900 text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="acepta-reglas"
                    className="text-xs text-zinc-300 leading-relaxed cursor-pointer select-none"
                  >
                    He leído y acepto los{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setMostrarReglasModal(true);
                      }}
                      className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 underline underline-offset-2 hover:opacity-85 inline-flex items-center gap-1"
                    >
                      Términos, Condiciones y Sistema de 3 Vidas (Strikes)
                    </button>
                    . Acepto que <strong>está prohibido subir contenido ajeno a la música</strong> y que a la <strong>3ra infracción (3 strikes)</strong> mi cuenta y todo mi contenido serán eliminados definitivamente de la plataforma.
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Shield className="h-3.5 w-3.5 text-amber-400" /> Sistema de 3 Vidas: Al 3er strike = Eliminación total
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMostrarReglasModal(true)}
                      className="text-purple-400 hover:text-purple-300 font-semibold underline text-[11px]"
                    >
                      Ver Resumen de Reglas
                    </button>
                    <span className="text-zinc-600">•</span>
                    <Link
                      href="/terminos"
                      target="_blank"
                      className="text-cyan-400 hover:text-cyan-300 font-semibold underline text-[11px]"
                    >
                      Leer Términos Completos
                    </Link>
                  </div>
                </div>
              </div>

              {/* Botones de Navegación de Paso 2 */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/10 bg-black/40 hover:bg-white/5 text-zinc-300 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Datos</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-3 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 text-xs sm:text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando tu cuenta...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      <span>
                        Completar Registro como{" "}
                        {tipo === "comprador"
                          ? "Oyente"
                          : tipo === "artista"
                          ? "Artista"
                          : "Productor"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Login Link */}
        <p className="text-center text-xs sm:text-sm text-zinc-400 mt-6">
          ¿Ya tienes una cuenta registrada?{" "}
          <Link
            href="/login"
            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-4"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      {/* Modal de Reglas de la Comunidad y Términos */}
      {mostrarReglasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-zinc-950 p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Scale className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Reglas Oficiales de la Comunidad Luba Beats
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Normas obligatorias de convivencia, autoría y comercialización.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarReglasModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
              {/* Highlight Sistema de 3 Vidas */}
              <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-zinc-900 to-amber-950/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                  <span className="text-base">☠️</span>
                  <span>Sistema de 3 Vidas (3 Strikes)</span>
                  <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300 ml-auto">
                    Norma Estricta
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  Cada usuario dispone de <strong>3 vidas</strong>. Cualquier infracción acumulará un strike:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className="rounded-xl border border-white/5 bg-black/40 p-2">
                    <span className="font-bold text-emerald-400 block mb-0.5">❤️ Vida 1</span>
                    <span className="text-zinc-400">Primer aviso y retiro de la pista u obra en falta.</span>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-2">
                    <span className="font-bold text-amber-400 block mb-0.5">💔 Vida 2</span>
                    <span className="text-amber-200/80">Suspensión preventiva y última oportunidad.</span>
                  </div>
                  <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-2">
                    <span className="font-bold text-red-400 block mb-0.5">☠️ Vida 3</span>
                    <span className="text-red-200/90 font-bold">Eliminación definitiva de cuenta y catálogo.</span>
                  </div>
                </div>
              </div>

              {/* 1. Contenido 100% Musical */}
              <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600/30 text-purple-400 text-xs font-mono">1</span>
                  <span>Contenido 100% Musical (Prohibido Otro Tipo de Material)</span>
                </div>
                <p className="text-zinc-400 pl-7 leading-relaxed">
                  Luba Beats es un ecosistema exclusivamente musical. <strong>Queda rotundamente prohibido subir cualquier archivo que no sea una pista de audio musical</strong> (están vetados audios cómicos, notas de voz, memes, discursos no musicales o archivos basura). Subir material ajeno a la música provocará la baja inmediata y la aplicación de un strike.
                </p>
              </div>

              {/* 2. Propiedad Intelectual */}
              <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600/30 text-purple-400 text-xs font-mono">2</span>
                  <span>Propiedad Intelectual y Originalidad Obligatoria</span>
                </div>
                <p className="text-zinc-400 pl-7 leading-relaxed">
                  Toda instrumental, pista o beat que subas debe ser <strong className="text-zinc-200">100% de tu autoría</strong> o contar con derechos de uso comercial. Queda prohibido el plagio o resubir instrumentales ajenas descargadas de internet.
                </p>
              </div>

              {/* 3. Pagos y Fraude Cero */}
              <div className="rounded-2xl border border-white/5 bg-zinc-900/60 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600/30 text-purple-400 text-xs font-mono">3</span>
                  <span>Transacciones Claras y Fraude Cero</span>
                </div>
                <p className="text-zinc-400 pl-7 leading-relaxed">
                  Todos los pagos (Culqi, Yape, Plin) se auditan electrónicamente. Intentos de estafa con comprobantes falsos causarán la cancelación de la cuenta y veto permanente.
                </p>
              </div>

              {/* Enlace oficial */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-center">
                <p className="text-xs text-zinc-300">
                  ¿Deseas leer el documento legal completo?{' '}
                  <Link
                    href="/terminos"
                    target="_blank"
                    className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-2"
                  >
                    Ver Términos y Condiciones Oficiales de Luba Beats
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-5">
              <button
                type="button"
                onClick={() => setMostrarReglasModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAceptaReglas(true);
                  setMostrarReglasModal(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Entendido y Aceptar Reglas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
