/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // ESLint no está configurado en este proyecto (sin .eslintrc ni dependencia instalada);
  // forzarlo en build rompería por eso, no por errores reales de lint.
  eslint: { ignoreDuringBuilds: true },

  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Resto de páginas: se permite que el navegador guarde una copia, pero SIEMPRE debe
        // revalidar con el servidor antes de usarla (no-cache != no-store). Así se evita el
        // problema de contenido viejo, sin forzar una re-descarga completa en cada visita.
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, must-revalidate' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Rutas de API: esta regla, al ser la más específica y estar declarada al final,
        // sobrescribe el Cache-Control de la regla general de arriba. Siguen sin cachearse
        // nunca (evita que Hostinger sirva datos viejos).
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
