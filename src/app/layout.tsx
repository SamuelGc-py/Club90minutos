import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Polla Liga BetPlay — Demuestra lo que sabes de fútbol",
  description: "Plataforma oficial de pronósticos Liga BetPlay Dimayor II 2026",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  verification: {
    google: "uPe2DKottfxU6Pxg7hB5qeEYAp2rbvojjt2YgbwZNHE",
  },
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
                var target = e.target || e.srcElement;
                var isScript = target && target.tagName === 'SCRIPT';
                var isChunkError = e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1);
                if (isChunkError || (isScript && target.src && target.src.indexOf('/_next/static/chunks/') !== -1)) {
                  var r = sessionStorage.getItem('chunk_reload');
                  if (!r) {
                    sessionStorage.setItem('chunk_reload', 'true');
                    window.location.reload(true);
                  }
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && (e.reason.message.indexOf('Loading chunk') !== -1 || e.reason.message.indexOf('ChunkLoadError') !== -1)) {
                  var r = sessionStorage.getItem('chunk_reload');
                  if (!r) {
                    sessionStorage.setItem('chunk_reload', 'true');
                    window.location.reload(true);
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
