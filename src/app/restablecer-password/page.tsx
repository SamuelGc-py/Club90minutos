"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function RestablecerPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Enlace de recuperación inválido o ausente.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Hubo un error al restablecer la contraseña.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Enlace Inválido</h2>
          <p className="text-gray-400 mb-6">No se encontró un token válido en la URL.</p>
          <Link href="/" className="text-green-400 hover:text-green-300 font-medium">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Crear Nueva Contraseña</h2>
          <p className="text-gray-400 mt-2 text-sm">
            Ingresa tu nueva contraseña para acceder a tu cuenta.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success ? (
          <div className="mb-6 bg-green-900/50 border border-green-500/50 text-green-200 p-6 rounded-xl flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <div>
              <p className="font-semibold text-lg text-green-300">¡Contraseña Actualizada!</p>
              <p className="text-sm mt-2 mb-6">Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión.</p>
              <button
                onClick={() => router.push("/")}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl transition-all"
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar Contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RestablecerPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando...</div>}>
      <RestablecerPasswordContent />
    </Suspense>
  );
}
