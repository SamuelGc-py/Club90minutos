import "./globals.css";
import type { Metadata, Viewport } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Polla Liga BetPlay — Demuestra lo que sabes de fútbol",
  description: "Plataforma oficial de pronósticos Liga BetPlay Dimayor II 2026",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1)) {
                  var r = sessionStorage.getItem('chunk_reload');
                  if (!r) {
                    sessionStorage.setItem('chunk_reload', 'true');
                    window.location.reload();
                  }
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && (e.reason.message.indexOf('Loading chunk') !== -1 || e.reason.message.indexOf('ChunkLoadError') !== -1)) {
                  var r = sessionStorage.getItem('chunk_reload');
                  if (!r) {
                    sessionStorage.setItem('chunk_reload', 'true');
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
