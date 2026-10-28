/**
 * SectionScroller — scroll ACTIVO entre secciones de la landing ("jala a la sección").
 *
 * Intercepta rueda del mouse y gestos táctiles para animar el scroll hacia la sección
 * siguiente/anterior. Dos modos:
 *
 *  - 'auto-soft'   : enganche permisivo. Deja ver las secciones largas (scroll normal dentro de
 *                    ellas) y, al llegar al borde, engancha suavemente a la siguiente.
 *  - 'auto-strict' : enganche decidido (tipo fullpage) PERO respetando secciones largas: si la
 *                    sección aún tiene contenido fuera del viewport en la dirección del gesto, deja
 *                    recorrerla; solo cuando está al borde, salta de una a la siguiente.
 *
 * Diferencia práctica: en ambos se puede ver una sección larga completa; el 'strict' engancha con
 * una animación más corta/decidida y no permite "quedarse a medias" entre dos secciones cortas.
 *
 * Robustez (fix trackball rápido):
 *  - Mientras una animación de salto está en curso, TODOS los eventos wheel se consumen
 *    (preventDefault) y se ignoran: así una ráfaga de la rueda no "atora" ni encadena saltos.
 *  - Hay un cooldown tras cada salto para que un gesto largo no dispare varios saltos.
 */
export type SectionScrollMode = 'auto-soft' | 'auto-strict';

export class SectionScroller {
  private mode: SectionScrollMode = 'auto-soft';
  private enabled = false;
  private animating = false;
  private lastJumpAt = 0;

  // Táctil
  private touchStartY = 0;

  // Umbrales
  private readonly EDGE_TOLERANCE = 6;       // px de holgura para considerar "al borde" de la sección
  private readonly TOUCH_THRESHOLD = 45;     // px de swipe mínimo para disparar salto
  private readonly STEP_SOFT = 0.85;         // fracción del viewport que avanza el scroll dentro de una sección larga
  // Cooldown tras un salto (ms). Estricto un poco mayor para que un gesto decidido no encadene.
  private get cooldown() { return this.mode === 'auto-strict' ? 700 : 520; }
  private get animDuration() { return this.mode === 'auto-strict' ? 520 : 640; }

  private wheelHandler = (e: WheelEvent) => this.onWheel(e);
  private touchStartHandler = (e: TouchEvent) => { this.touchStartY = e.touches[0].clientY; };
  private touchEndHandler = (e: TouchEvent) => this.onTouchEnd(e);
  private keyHandler = (e: KeyboardEvent) => this.onKey(e);

  enable(mode: SectionScrollMode) {
    this.mode = mode;
    if (this.enabled) return;
    this.enabled = true;
    window.addEventListener('wheel', this.wheelHandler, { passive: false });
    window.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    window.addEventListener('touchend', this.touchEndHandler, { passive: false });
    window.addEventListener('keydown', this.keyHandler);
  }

  setMode(mode: SectionScrollMode) { this.mode = mode; }

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    window.removeEventListener('wheel', this.wheelHandler);
    window.removeEventListener('touchstart', this.touchStartHandler);
    window.removeEventListener('touchend', this.touchEndHandler);
    window.removeEventListener('keydown', this.keyHandler);
  }

  /** Puntos de enganche en orden vertical: secciones normales (#section-*) + cada mini-sección
      individual (.details-mini/.venues-mini/.dress-mini). Se descartan los contenedores wrapper de
      las mini-secciones (#section-details/venues/dresscode), que no son puntos de parada propios. */
  private sections(): HTMLElement[] {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[id^="section-"], .details-mini, .venues-mini, .dress-mini')
    );
    const wrappers = new Set(['section-details', 'section-venues', 'section-dresscode']);
    return nodes.filter((el) => !wrappers.has(el.id));
  }

  // ===== Gestos =====
  private onWheel(e: WheelEvent) {
    if (!this.enabled) return;
    // Durante la animación: consumir TODO (no dejar pasar scroll nativo ni encadenar). Esto arregla
    // el "atasco" del trackball rápido: la ráfaga de eventos se ignora limpiamente.
    if (this.animating) { e.preventDefault(); return; }
    const dir = e.deltaY > 0 ? 1 : (e.deltaY < 0 ? -1 : 0);
    if (dir === 0) return;
    // ¿La sección actual tiene contenido por recorrer en esta dirección? → avanzar DENTRO de ella
    // (scroll por pasos controlado por nosotros), sin saltar de sección. Vale para AMBOS modos:
    // así las secciones largas (galería, vestimenta) se ven completas antes de enganchar.
    if (this.hasRoomWithinCurrent(dir)) {
      e.preventDefault();
      this.stepWithinCurrent(dir);
      return;
    }
    // Al borde de la sección → saltar a la siguiente/anterior.
    e.preventDefault();
    this.jump(dir);
  }

  private onTouchEnd(e: TouchEvent) {
    if (!this.enabled || this.animating) return;
    const endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : this.touchStartY;
    const dy = this.touchStartY - endY; // >0 = swipe hacia arriba = avanzar
    if (Math.abs(dy) < this.TOUCH_THRESHOLD) return;
    const dir = dy > 0 ? 1 : -1;
    if (this.hasRoomWithinCurrent(dir)) { this.stepWithinCurrent(dir); return; }
    this.jump(dir);
  }

  private onKey(e: KeyboardEvent) {
    if (!this.enabled || this.animating) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); this.hasRoomWithinCurrent(1) ? this.stepWithinCurrent(1) : this.jump(1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); this.hasRoomWithinCurrent(-1) ? this.stepWithinCurrent(-1) : this.jump(-1); }
  }

  /** ¿La sección actual tiene contenido fuera del viewport en la dirección dir (sección más alta
      que la pantalla y aún no estamos en su borde)? */
  private hasRoomWithinCurrent(dir: number): boolean {
    const current = this.currentSection();
    if (!current) return false;
    const rect = current.getBoundingClientRect();
    const vh = window.innerHeight;
    // Si la sección cabe entera en el viewport, no hay "room" interno: se salta de una.
    if (rect.height <= vh + this.EDGE_TOLERANCE) return false;
    if (dir > 0) return rect.bottom > vh + this.EDGE_TOLERANCE;      // queda contenido abajo
    return rect.top < -this.EDGE_TOLERANCE;                          // queda contenido arriba
  }

  /** Avanza el scroll DENTRO de la sección actual un paso (~0.85 del viewport), con animación, sin
      pasar del borde de la sección (así no se "mete" en la siguiente de un paso). */
  private stepWithinCurrent(dir: number) {
    const current = this.currentSection();
    if (!current) return;
    const vh = window.innerHeight;
    const rect = current.getBoundingClientRect();
    const startY = window.scrollY;
    let targetY: number;
    if (dir > 0) {
      // Bajar hasta ~0.85vh, pero sin rebasar el borde inferior de la sección (tope del viewport).
      const maxDown = startY + (rect.bottom - vh);
      targetY = Math.min(startY + vh * this.STEP_SOFT, maxDown);
    } else {
      const maxUp = startY + rect.top;
      targetY = Math.max(startY - vh * this.STEP_SOFT, maxUp);
    }
    this.animateToY(Math.round(targetY), this.animDuration);
  }

  /** Sección cuyo rango vertical contiene el punto de referencia (cerca del tope del viewport). */
  private currentSection(): HTMLElement | null {
    const list = this.sections();
    if (!list.length) return null;
    const probe = window.innerHeight * 0.35;
    let best: HTMLElement | null = null;
    let bestDist = Infinity;
    for (const el of list) {
      const r = el.getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) return el;
      const dist = Math.min(Math.abs(r.top - probe), Math.abs(r.bottom - probe));
      if (dist < bestDist) { bestDist = dist; best = el; }
    }
    return best;
  }

  private jump(dir: number) {
    const now = Date.now();
    if (now - this.lastJumpAt < this.cooldown) return;
    const list = this.sections();
    if (!list.length) return;
    const current = this.currentSection();
    const idx = current ? list.indexOf(current) : 0;
    const targetIdx = Math.max(0, Math.min(list.length - 1, idx + dir));
    if (targetIdx === idx) return;
    this.lastJumpAt = now;
    const target = list[targetIdx];
    this.animateToY(Math.round(window.scrollY + target.getBoundingClientRect().top), this.animDuration);
  }

  /** Anima el scroll del documento hasta la posición absoluta targetY. */
  private animateToY(targetY: number, dur: number) {
    const startY = window.scrollY;
    const delta = targetY - startY;
    if (Math.abs(delta) < 2) return;
    this.animating = true;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      window.scrollTo(0, Math.round(startY + delta * ease(t)));
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        this.animating = false;
      }
    };
    requestAnimationFrame(step);
  }
}
