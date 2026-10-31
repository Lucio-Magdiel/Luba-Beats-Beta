"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Music2,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"password" | "magic">("password");
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSuccess, setMagicSuccess] = useState<string | null>(null);
  const [devMagicLink, setDevMagicLink] = useState<string | null>(null);

  // Login tradicional con identificador y contraseña
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        identificador,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Usuario, correo o contraseña incorrectos.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor.");
      setLoading(false);
    }
  };

  // Solicitar Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMagicSuccess(null);
    setDevMagicLink(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo generar el enlace.");
      } else {
        setMagicSuccess(
          `¡Enlace generado! Revisa la bandeja de entrada de ${magicEmail} o pulsa el enlace directo abajo.`
        );
        if (data.magicLink) {
          setDevMagicLink(data.magicLink);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
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
              Acceso a la Plataforma
            </span>
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Bienvenido de nuevo</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Ingresa a tu cuenta para gestionar beats, compras y música
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="relative rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-7 shadow-2xl shadow-purple-950/30 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/5 rounded-xl mb-6 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode("password");
              setError(null);
            }}
            className={`py-2 rounded-lg font-medium transition-all ${
              mode === "password"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Contraseña
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("magic");
              setError(null);
            }}
            className={`py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              mode === "magic"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" /> Magic Link
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Magic Success Alert */}
        {magicSuccess && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm space-y-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{magicSuccess}</span>
            </div>
            {devMagicLink && (
              <a
                href={devMagicLink}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold transition-all border border-emerald-500/30"
              >
                Ingresar directamente ahora <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Form: Password Login */}
        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Usuario o Correo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  placeholder="ej. chojin o tu@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setMode("magic")}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  Iniciar Sesión <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Form: Magic Link */}
        {mode === "magic" && (
          <form onSubmit={handleMagicLink} className="space-y-4">
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
                  value={magicEmail}
                  onChange={(e) => setMagicEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Te enviaremos un enlace de un solo uso que te permitirá entrar al instante sin escribir contraseñas.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generando Enlace...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Enviar Enlace Mágico
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-3 text-zinc-500 font-mono">o continúa con</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-black/30 hover:bg-white/5 text-zinc-200 hover:text-white font-medium text-sm flex items-center justify-center gap-3 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </button>
      </div>

      {/* Footer Register Link */}
      <p className="text-center text-sm text-zinc-400 mt-6">
        ¿Aún no tienes una cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-4"
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#09090b] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background Neon Elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            Cargando login...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
