"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

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
    if (!password || password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
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
        throw new Error(data.error || "Hubo un error al restablecer tu contraseña.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="card" style={{ maxWidth: 450, width: "100%", padding: "40px 30px", textAlign: "center" }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--cancha-suave)",
            border: "1px solid var(--cancha-borde)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--cancha)",
            marginBottom: 16,
          }}
        >
          <Lock size={28} />
        </div>

        <h1 style={{ fontSize: "1.75rem", marginBottom: 6 }}>Crear Nueva Contraseña</h1>
        <p style={{ color: "var(--graderia)", fontSize: "0.9rem", marginBottom: 28 }}>
          Ingresa tu nueva contraseña para acceder a tus pronósticos.
        </p>

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 10,
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
              textAlign: "left",
              background: "var(--rojo-suave)",
              color: "var(--rojo-fuerte)",
              border: "1px solid var(--rojo-borde)",
            }}
          >
            <AlertCircle size={20} />
            <div>{error}</div>
          </div>
        )}

        {success ? (
          <div
            style={{
              marginBottom: 20,
              padding: "14px 16px",
              borderRadius: 10,
              fontSize: "0.88rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              textAlign: "center",
              background: "var(--cancha-suave)",
              color: "var(--cancha)",
              border: "1px solid var(--cancha-borde)",
            }}
          >
            <CheckCircle2 size={36} style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
              Contraseña guardada con éxito
            </div>
            <Link
              href="/"
              className="btn btn-primary"
              style={{ padding: "10px 20px", textDecoration: "none", width: "100%" }}
            >
              Iniciar Sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", marginBottom: 6, display: "block" }}>
                Nueva Contraseña
              </label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", marginBottom: 6, display: "block" }}>
                Confirmar Contraseña
              </label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || !!error}
              className="btn btn-primary"
              style={{ width: "100%", padding: "14px 20px", marginTop: 10 }}
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
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--texto-principal)" }}>Cargando...</div>}>
      <RestablecerPasswordContent />
    </Suspense>
  );
}
