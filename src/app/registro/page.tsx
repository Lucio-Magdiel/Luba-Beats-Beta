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
    </div>
  );
}
