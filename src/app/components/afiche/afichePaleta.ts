// Paleta y tipografía de marca (Manual de Marca Club90Minutos v1.0) para los
// componentes "Afiche" (exportados a PNG vía html-to-image). Se usan valores
// hex literales a propósito, no var(--...): estos componentes no necesitan
// responder al toggle data-design (una imagen descargada no "cambia de tema"),
// y evita cualquier riesgo de que html-to-image no resuelva una custom
// property al clonar el nodo para la captura.
export const AFICHE = {
  negroEstadio: "#04060A",
  verdeClub: "#74CC10",
  azulElectrico: "#438AFF",
  amarilloEnergia: "#EFCC36",
  rojoAlerta: "#EA3D35",
  grisOscuro: "#1A1F26",
  grisMedio: "#6B7280",
  grisClaro: "#E5E7EB",
  blanco: "#FFFFFF",
  fuenteDisplay: "'Orbitron', sans-serif",
  fuenteBody: "'Inter', sans-serif",
  fuenteMono: "'JetBrains Mono', monospace",
} as const;
