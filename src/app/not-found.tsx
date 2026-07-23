import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>404 - Página no encontrada</h1>
      <p style={{ color: "var(--graderia)", marginBottom: 24 }}>La página que buscas no existe.</p>
      <Link href="/" className="btn btn-primary">
        Volver al Inicio
      </Link>
    </div>
  );
}
