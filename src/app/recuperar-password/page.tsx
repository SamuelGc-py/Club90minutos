"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export default function RecuperarPassword() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) return;

    setLoading(true);
    setError("");
    setResetUrl("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No pudimos procesar tu solicitud.");
      }

      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      } else {
        setSuccessMsg("Si tu correo está registrado, te hemos enviado las instrucciones.");
      }
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
          <KeyRound size={28} />
        </div>

        <h1 style={{ fontSize: "1.75rem", marginBottom: 6 }}>Recuperar Contraseña</h1>
        <p style={{ color: "var(--graderia)", fontSize: "0.9rem", marginBottom: 28 }}>
          Ingresa tu correo para generar tu enlace de recuperación de contraseña.
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

        {resetUrl ? (
          <div
            style={{
              marginBottom: 20,
              padding: "20px 18px",
              borderRadius: 14,
              background: "rgba(16, 185, 129, 0.12)",
              border: "1.5px solid #10b981",
              textAlign: "center",
            }}
          >
            <CheckCircle2 size={42} style={{ color: "#10b981", marginBottom: 10 }} />
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#34d399", marginBottom: 8 }}>
              ¡Enlace de Recuperación Generado!
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--graderia)", marginBottom: 18 }}>
              Haz clic en el siguiente botón para escribir tu nueva contraseña inmediatamente:
            </p>
            <a
              href={resetUrl}
              className="btn btn-primary"
              style={{
                display: "block",
                width: "100%",
                padding: "14px 20px",
                textAlign: "center",
                textDecoration: "none",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1rem",
                borderRadius: 10,
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
              }}
            >
              🔑 Crear Mi Nueva Contraseña
            </a>
          </div>
        ) : successMsg ? (
          <div
            style={{
              marginBottom: 20,
              padding: "20px 18px",
              borderRadius: 14,
              background: "var(--cancha-suave)",
              color: "var(--cancha)",
              border: "1px solid var(--cancha-borde)",
            }}
          >
            <CheckCircle2 size={40} style={{ marginBottom: 10 }} />
            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>¡Instrucciones Enviadas!</div>
            <div style={{ fontSize: "0.88rem", marginTop: 6 }}>{successMsg}</div>
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
              {loading ? "Generando Enlace..." : "Continuar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
