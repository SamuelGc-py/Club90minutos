import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polla FPC Express — Pronósticos Rápidos",
  description: "Plataforma simplificada de predicciones Liga BetPlay Dimayor II 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <header className="navbar">
          <div className="brand">
            ⚽ Polla FPC <span className="brand-badge">Express</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--graderia)" }}>
            Liga BetPlay Dimayor II 2026
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
