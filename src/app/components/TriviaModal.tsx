import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TriviaPregunta {
  pregunta: string;
  opciones: string[];
  respuesta_correcta_index: number;
  dato_curioso_acierto: string;
  dato_curioso_fallo: string;
}

export default function TriviaModal({ onClose }: { onClose: () => void }) {
  const [cargando, setCargando] = useState(false);
  const [trivia, setTrivia] = useState<TriviaPregunta | null>(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [yaRespondio, setYaRespondio] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [nivel, setNivel] = useState(1);

  useEffect(() => {
    if (trivia && !yaRespondio && timeLeft !== null && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    } else if (timeLeft === 0 && !yaRespondio) {
      setYaRespondio(true);
      toast.error("¡Se acabó el tiempo!");
    }
  }, [trivia, yaRespondio, timeLeft]);

  const generarTrivia = async () => {
    setCargando(true);
    setYaRespondio(false);
    setOpcionSeleccionada(null);
    setTrivia(null);
    setTimeLeft(null);
    
    try {
      const res = await fetch(`/api/ai/trivia?nivel=${nivel}`);
      if (!res.ok) throw new Error('Error al cargar la trivia');
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setTrivia(data);
      setTimeLeft(15);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'No se pudo generar la pregunta, intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const seleccionarOpcion = (index: number) => {
    if (yaRespondio) return;
    setOpcionSeleccionada(index);
    setYaRespondio(true);
    
    if (index === trivia?.respuesta_correcta_index) {
        toast.success("¡Eso es! Sabes de fútbol colombiano de verdad.");
        setNivel(prev => prev + 1);
    } else {
        toast.error("¡Eche, esa te quedó grande! Sigue así.");
        setNivel(1);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(4, 6, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      overflowY: 'auto',
      zIndex: 9999, padding: '40px 20px'
    }}>
      <div style={{
        background: '#04060A',
        border: '1px solid #74CC10',
        borderRadius: 20,
        width: '100%', maxWidth: 500,
        maxHeight: '100%',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: "none"}}>
        {/* Header */}
        <div style={{
          flexShrink: 0,
          padding: '20px', background: '#1A1F26',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid rgba(116, 204, 16, 0.3)'
        }}>
          <h2 style={{ margin: 0, color: '#74CC10', display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.2rem', fontWeight: 800 }}>
            <img src="/marca/logo-club90-escudo-balon.webp" alt="" style={{ height: 36, width: 36, objectFit: 'cover', borderRadius: '50%' }} />
            Preguntas con club90min
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          {!trivia && !cargando && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#E5E7EB', marginBottom: 20, fontSize: '1rem', lineHeight: '1.5' }}>
                ¿Crees que te las sabes todas del Fútbol Profesional Colombiano? Ponte a prueba con nuestras preguntas.
              </p>
              <button
                onClick={generarTrivia}
                style={{
                  background: '#74CC10', color: '#04060A', border: 'none', padding: '12px 24px',
                  borderRadius: 30, fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                  boxShadow: "none",
                  display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto'
                }}
              >
                <img src="/marca/logo-club90-escudo-balon.webp" alt="" style={{ height: 28, width: 28, objectFit: 'cover', borderRadius: '50%' }} />
                Generar pregunta
              </button>
            </div>
          )}

          {cargando && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <RefreshCw size={40} color="#74CC10" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
              <p style={{ color: '#74CC10', marginTop: 16, fontWeight: 600 }}>Preparando una pregunta bacana...</p>
            </div>
          )}

          {trivia && !cargando && (
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginBottom: 24, lineHeight: '1.5', fontWeight: 600 }}>
                {trivia.pregunta}
              </h3>

              {timeLeft !== null && !yaRespondio && (
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#74CC10', width: `${(timeLeft / 15) * 100}%`, transition: 'width 1s linear' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Nivel {nivel}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {trivia.opciones.map((opcion, idx) => {
                  const esCorrecta = idx === trivia.respuesta_correcta_index;
                  const fueSeleccionada = idx === opcionSeleccionada;
                  
                  let bg = 'rgba(255,255,255,0.05)';
                  let border = '1px solid rgba(255,255,255,0.1)';
                  
                  if (yaRespondio) {
                    if (esCorrecta) {
                        bg = 'rgba(116, 204, 16, 0.2)';
                        border = '1px solid #74CC10';
                    } else if (fueSeleccionada) {
                        bg = 'rgba(234, 61, 53, 0.2)';
                        border = '1px solid #EA3D35';
                    }
                  } else if (fueSeleccionada) {
                     bg = 'rgba(67, 138, 255, 0.2)';
                     border = '1px solid #438AFF';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => seleccionarOpcion(idx)}
                      disabled={yaRespondio}
                      style={{
                        background: bg,
                        border: border,
                        color: '#FFFFFF',
                        padding: '14px 18px',
                        borderRadius: 12,
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        cursor: yaRespondio ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      {opcion}
                      {yaRespondio && esCorrecta && <CheckCircle2 size={20} color="#74CC10" />}
                      {yaRespondio && fueSeleccionada && !esCorrecta && <XCircle size={20} color="#EA3D35" />}
                    </button>
                  );
                })}
              </div>

              {yaRespondio && (
                <div style={{ 
                  marginTop: 24, background: 'rgba(67, 138, 255, 0.1)', border: '1px solid rgba(67, 138, 255, 0.3)',
                  padding: 16, borderRadius: 12 
                }}>
                  <p style={{ margin: 0, color: '#438AFF', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <strong>Dato curioso:</strong> {opcionSeleccionada === trivia.respuesta_correcta_index ? trivia.dato_curioso_acierto : trivia.dato_curioso_fallo}
                  </p>
                </div>
              )}

              {yaRespondio && (
                <button 
                  onClick={generarTrivia}
                  style={{
                    width: '100%', background: 'transparent', color: '#74CC10', border: '1px solid #74CC10', 
                    padding: '12px 24px', marginTop: 24,
                    borderRadius: 30, fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  <RefreshCw size={20} />
                  Siguiente pregunta
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
