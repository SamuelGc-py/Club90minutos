# Reglas Obligatorias del Proyecto - Polla Liga BetPlay

1. **Despliegue Dual Automático a GitHub**:
   - Todo cambio aprobado DEBE subirse a ambos repositorios de GitHub (`polla-express.git` y `Club90minutos.git`) ejecutando `git push origin main`.

2. **Verificación de Compilación Antes de Confirmar**:
   - Ejecutar `npm run build` localmente antes de confirmar cualquier cambio al usuario para garantizar 0 errores de TypeScript o sintaxis.

3. **Prevención Total de Pantallas de Error**:
   - Todo componente o vista client-side en Next.js debe estar protegido con `GlobalErrorBoundary` y bloques `try-catch` para evitar fallos de caché o hidratación.

4. **Diseño e Interfaz**:
   - Mantener tarjetas colapsadas por defecto al iniciar sesión.
   - Ocultar botón de despliegue en partidos terminados (`🏁 Terminado`).
   - Ubicación fija de botones en barra de navegación superior.
