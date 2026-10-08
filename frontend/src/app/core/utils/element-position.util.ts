import { ElementPositions } from '../models/models';

/**
 * Devuelve el estilo de posicionamiento absoluto para un elemento dentro de su sección,
 * según las posiciones guardadas y el dispositivo activo.
 *
 * - Si existe posición para el dispositivo actual (o fallback al otro), devuelve un objeto
 *   con position:absolute centrado en (x,y) en %.
 * - Si no existe ninguna, devuelve {} para que el elemento conserve el layout por defecto
 *   (flex), garantizando retrocompatibilidad.
 */
export function posStyle(
  key: string,
  positions: ElementPositions | undefined | null,
  isMobile: boolean
): Record<string, string> {
  if (!positions) return {};
  const dev = isMobile ? 'mobile' : 'desktop';
  const other = isMobile ? 'desktop' : 'mobile';
  const pos = positions[dev]?.[key] ?? positions[other]?.[key];
  if (!pos) return {};
  const style: Record<string, string> = {
    position: 'absolute',
    left: pos.x + '%',
    top: pos.y + '%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    margin: '0',
  };
  if (pos.w != null) {
    style['width'] = pos.w + '%';
  }
  if (pos.h != null) {
    style['height'] = pos.h + '%';
  }
  return style;
}
