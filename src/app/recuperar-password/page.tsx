"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RecuperarPassword() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Hubo un error al enviar el correo.");
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
        
        <button 
          onClick={() => router.push("/")}
          style={{
            display: "flex",
            alignItems: "center",
            color: "var(--graderia)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            marginBottom: 24,
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} style={{ marginRight: 8 }} />
          Volver al inicio
        </button>

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
          <Mail size={28} />
        </div>

        <h1 style={{ fontSize: "1.75rem", marginBottom: 6 }}>Recuperar Contraseña</h1>
        <p style={{ color: "var(--graderia)", fontSize: "0.9rem", marginBottom: 28 }}>
          Ingresa tu correo y te enviaremos un enlace para cambiar tu contraseña.
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
            <CheckCircle2 size={36} style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>¡Enlace enviado!</div>
            <div>Revisa tu bandeja de entrada o la carpeta de spam para restablecer tu contraseña.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--graderia)", marginBottom: 6, display: "block" }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="input"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !correo.trim()}
              style={{ width: "100%", padding: "14px 20px", marginTop: 10 }}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
