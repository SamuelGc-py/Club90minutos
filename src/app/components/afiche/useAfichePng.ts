import { useRef, useState } from "react";
import { toPng } from "html-to-image";

// Hook compartido por los 3 componentes "Afiche" (TablaPosicionesAfiche,
// PronosticosPartidoAfiche, PronosticosTorneoAfiche): antes cada uno
// reimplementaba el mismo patrón de "ref de impresión + estado de carga +
// exportar a PNG" por separado.
export function useAfichePng(nombreArchivo: string) {
  const printRef = useRef<HTMLDivElement>(null);
  const [generandoImagen, setGenerandoImagen] = useState(false);

  const descargarImagen = async () => {
    if (!printRef.current) return;
    try {
      setGenerandoImagen(true);
      const dataUrl = await toPng(printRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement("a");
      link.download = nombreArchivo;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error al generar la imagen del afiche:", err);
      alert("No se pudo generar la imagen. Intenta desde un computador si estás en móvil.");
    } finally {
      setGenerandoImagen(false);
    }
  };

  return { printRef, generandoImagen, descargarImagen };
}
