import { MediaBackground, SectionStyle } from '../models/models';

/** Extensiones consideradas video (render como <video> en vez de background-image). */
const VIDEO_EXTS = ['mp4', 'webm', 'ogg'];

/** Determina si una URL apunta a un video por su extensión. */
export function isVideoUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
  return VIDEO_EXTS.includes(ext);
}

/** Resultado de resolver una media de fondo para el dispositivo activo. */
export interface ResolvedMedia {
  /** URL efectiva (según override desktop). Vacío si no hay media. */
  url: string;
  /** True si la URL efectiva es un video. */
  isVideo: boolean;
  /** Encuadre. */
  fit: 'cover' | 'contain' | 'banner';
  /** Posición del encuadre (background-position / object-position). */
  position: string;
  /** Oscurecido 0-100. */
  overlay: number;
  /** Ancho de la columna banner en % (solo relevante si fit='banner'). */
  bannerWidth: number;
  /** True si hay una URL efectiva que renderizar. */
  hasMedia: boolean;
}

/**
 * Resuelve una MediaBackground a sus valores efectivos para el dispositivo activo.
 *
 * - Elige `urlDesktop` cuando `desktopOverride` está activo, es escritorio y hay urlDesktop;
 *   en cualquier otro caso usa `url` (la base).
 * - `isVideo` se decide por la extensión de la URL efectiva.
 * - Rellena defaults sensatos para fit/position/overlay/bannerWidth.
 *
 * Devuelve siempre un objeto; `hasMedia`/`url` vacíos si no hay nada que renderizar.
 */
export function resolveMedia(
  mb: MediaBackground | undefined | null,
  isDesktop: boolean
): ResolvedMedia {
  const empty: ResolvedMedia = {
    url: '', isVideo: false, fit: 'cover', position: 'center center',
    overlay: 0, bannerWidth: 70, hasMedia: false,
  };
  if (!mb) return empty;

  const useDesktop = !!(mb.desktopOverride && isDesktop && mb.urlDesktop);
  const url = (useDesktop ? mb.urlDesktop : mb.url) || '';
  // Encuadre/ancho EFECTIVOS: en escritorio usa los campos *Desktop si existen (fallback a los
  // base = regla de móvil de siempre). En móvil usa SIEMPRE los base. Así separar el ajuste de
  // escritorio no altera el de móvil, y las configs previas (sin *Desktop) se comportan igual.
  const effFit = (isDesktop ? (mb.fitDesktop ?? mb.fit) : mb.fit) || 'cover';
  const effBannerWidth = (isDesktop ? (mb.bannerWidthDesktop ?? mb.bannerWidth) : mb.bannerWidth) ?? 70;
  if (!url) return { ...empty, fit: effFit, position: mb.position || 'center center', overlay: mb.overlay ?? 0, bannerWidth: effBannerWidth };

  return {
    url,
    isVideo: isVideoUrl(url),
    fit: effFit,
    position: mb.position || 'center center',
    overlay: mb.overlay ?? 0,
    bannerWidth: effBannerWidth,
    hasMedia: true,
  };
}

/**
 * Construye un MediaBackground a partir de los campos LEGACY de un SectionStyle
 * (bgImage/bgFit/bgBannerWidth/bgOverlay). Útil como fallback retrocompatible: si la sección
 * no tiene `media` definido pero sí los campos viejos, se arma una MediaBackground equivalente.
 * Devuelve null si no hay imagen legacy.
 */
export function sectionStyleToMedia(ss: SectionStyle | undefined | null): MediaBackground | null {
  if (!ss) return null;
  if (ss.media && ss.media.url) return ss.media;
  if (ss.bgType === 'image' && ss.bgImage) {
    return {
      url: ss.bgImage,
      fit: ss.bgFit || 'cover',
      bannerWidth: ss.bgBannerWidth ?? 70,
      overlay: ss.bgOverlay ?? 0,
      position: 'center center',
    };
  }
  // Si media existe pero sin url, respetarla igual (puede traer solo ajustes).
  return ss.media ?? null;
}

/**
 * Construye un MediaBackground para el FONDO GLOBAL de la landing con fallback retrocompatible:
 * usa `theme.landingBg` si tiene url; si no, cae a `heroBackgroundGif` (comportamiento actual).
 */
export function resolveGlobalBackground(
  landingBg: MediaBackground | undefined | null,
  heroBackgroundGif: string | undefined | null
): MediaBackground | null {
  if (landingBg && landingBg.url) return landingBg;
  if (heroBackgroundGif) {
    return { url: heroBackgroundGif, fit: 'cover', position: 'center center', overlay: 0, bannerWidth: 70 };
  }
  // landingBg puede traer solo ajustes sin url; devolverlo igualmente.
  return landingBg ?? null;
}
