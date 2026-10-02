/*
 * Isotipo y logotipo Club 90 (Manual de Marca v1.0, secciones 03–06).
 * Variante "sobre fondo oscuro": escudo en línea blanca, velocímetro y check en Verde Club,
 * balón blanco. Tamaño mínimo digital: 32 px (en barras de navegación 26–32 px).
 * No rotar, no estirar, sin sombras, sin colores fuera de la paleta.
 */

export function Isotipo({ size = 28, titulo = "Club 90 Minutos" }: { size?: number; titulo?: string }) {
  return (
    <svg
      width={(size * 240) / 260}
      height={size}
      viewBox="0 0 240 260"
      role="img"
      aria-label={titulo}
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d="M120,16 L204,50 L204,132 C204,190 168,228 120,250 C72,228 36,190 36,132 L36,50 Z"
        fill="#04060A"
        stroke="#FFFFFF"
        strokeWidth="14"
        strokeLinejoin="round"
      />
      <path d="M92,166 A42,42 0 0 1 92,106" fill="none" stroke="#74CC10" strokeWidth="12" strokeLinecap="round" />
      <circle cx="120" cy="136" r="24" fill="#FFFFFF" />
      <polygon points="120,127 129,133 126,143 114,143 111,133" fill="#04060A" />
      <path d="M152,110 L172,136 L152,162" fill="none" stroke="#74CC10" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Logotipo horizontal: isotipo + "CLUB90" (Orbitron 800, "90" en Verde Club). */
export function Logotipo({ size = 28 }: { size?: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <Isotipo size={size} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: size * 0.62,
          letterSpacing: "0.04em",
          color: "var(--color-blanco)",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        CLUB<span style={{ color: "var(--color-verde-club)" }}>90</span>
      </span>
    </span>
  );
}
