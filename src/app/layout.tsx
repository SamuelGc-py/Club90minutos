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
              (function() {
                function bustCacheReload() {
                  var attempts = parseInt(sessionStorage.getItem('chunk_reload_attempts') || '0', 10);
                  if (attempts >= 3) return;
                  sessionStorage.setItem('chunk_reload_attempts', String(attempts + 1));
                  var url = new URL(window.location.href);
                  url.searchParams.set('_cb', Date.now().toString());
                  window.location.replace(url.toString());
                }
                function isStaleAsset(target) {
                  if (!target || !target.tagName) return false;
                  if (target.tagName === 'SCRIPT' && target.src && target.src.indexOf('/_next/static/') !== -1) return true;
                  if (target.tagName === 'LINK' && target.rel === 'stylesheet' && target.href && target.href.indexOf('/_next/static/') !== -1) return true;
                  return false;
                }
                window.addEventListener('error', function(e) {
                  var target = e.target || e.srcElement;
                  var isChunkMsgError = e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('ChunkLoadError') !== -1);
                  if (isChunkMsgError || isStaleAsset(target)) {
                    bustCacheReload();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  if (e.reason && e.reason.message && (e.reason.message.indexOf('Loading chunk') !== -1 || e.reason.message.indexOf('ChunkLoadError') !== -1)) {
                    bustCacheReload();
                  }
                });
                window.addEventListener('DOMContentLoaded', function() {
                  setTimeout(function() {
                    sessionStorage.removeItem('chunk_reload_attempts');
                  }, 3000);
                });
              })();
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
