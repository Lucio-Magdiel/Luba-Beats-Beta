"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "No se proporcionó un token de validación válido."
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let isSubscribed = true;

    const processLogin = async () => {
      try {
        const res = await signIn("credentials", {
          magicToken: token,
          redirect: false,
        });

        if (!isSubscribed) return;

        if (res?.error) {
          setStatus("error");
          setErrorMessage("El enlace de acceso ha expirado o ya fue utilizado.");
        } else {
          setStatus("success");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
        }
      } catch (err) {
        console.error("Error al validar magic link:", err);
        if (isSubscribed) {
          setStatus("error");
          setErrorMessage("Ocurrió un error inesperado al validar tu enlace.");
        }
      }
    };

    processLogin();

    return () => {
      isSubscribed = false;
    };
  }, [token, router]);

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-2xl text-center">
      {status === "loading" && (
        <div className="py-8 space-y-4">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-white">Validando tu acceso...</h2>
          <p className="text-sm text-zinc-400">
            Estamos verificando tu enlace de seguridad. Serás redirigido en unos segundos.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="py-8 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-white">¡Sesión iniciada con éxito!</h2>
          <p className="text-sm text-zinc-400">
            Bienvenido de vuelta a Luba Beats. Entrando al estudio...
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="py-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Enlace no válido</h2>
          <p className="text-sm text-zinc-400">{errorMessage}</p>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-600/30"
            >
              Volver a Iniciar Sesión <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-zinc-400 text-sm flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            Cargando...
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
