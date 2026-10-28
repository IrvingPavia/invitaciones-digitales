import { Directive, ElementRef, Input, OnInit, OnDestroy, inject } from '@angular/core';

/**
 * Efecto de ENTRADA al hacer scroll (reveal). Unifica el reveal de la landing en un solo lugar.
 *
 * Uso básico (anima el contenedor completo):
 *   <div [appScrollReveal]="'fade-up'"> ... </div>
 *
 * Uso con STAGGER (anima los hijos indicados, escalonados uno tras otro):
 *   <div [appScrollReveal]="'fade-up'" revealStagger=".detail-card, h2"> ... </div>
 *
 * Animaciones soportadas (coinciden con theme.scrollAnimation):
 *   'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale' | 'none'
 *
 * Detalles:
 * - Usa IntersectionObserver: aplica el estado "oculto" al inicio y revela al entrar en viewport.
 * - En el BUILDER (iframe, sin ?preview=1) NO anima: muestra todo de inmediato (no estorbar el canvas).
 * - 'none' desactiva el efecto.
 * - Las clases CSS (.reveal-hidden / .reveal-in / .reveal-anim-*) viven en styles.scss (globales),
 *   para que funcionen tanto en el contenedor como en los hijos proyectados (::ng-deep no haría falta).
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  /** Tipo de animación. Vacío/undefined → 'fade-up'. 'none' desactiva. */
  @Input() appScrollReveal: string = 'fade-up';
  /** Selector CSS de los hijos a animar escalonados (stagger). Si se omite, anima el contenedor. */
  @Input() revealStagger = '';
  /** Retardo entre hijos en el stagger (ms). */
  @Input() revealStaggerStep = 90;
  /** Umbral de visibilidad para disparar (0-1). */
  @Input() revealThreshold = 0.12;

  ngOnInit() {
    const anim = this.appScrollReveal || 'fade-up';
    if (anim === 'none') return;
    // En el builder (iframe sin ?preview=1) no animamos: todo visible de inmediato.
    if (typeof window !== 'undefined' && window.self !== window.top && !window.location.search.includes('preview=1')) return;

    const host = this.el.nativeElement as HTMLElement;
    // Objetivos: los hijos del stagger si se indicó y existen; si no, el propio contenedor.
    const targets: HTMLElement[] = this.revealStagger
      ? Array.from(host.querySelectorAll(this.revealStagger)) as HTMLElement[]
      : [];
    const animated: HTMLElement[] = targets.length ? targets : [host];

    // Sembrar estado oculto + clase de animación + delay escalonado.
    animated.forEach((elTarget, i) => {
      elTarget.classList.add('reveal-hidden', `reveal-anim-${anim}`);
      if (animated.length > 1) {
        elTarget.style.setProperty('--reveal-delay', (i * this.revealStaggerStep) + 'ms');
      }
    });

    // Observamos el CONTENEDOR (host): cuando entra en viewport, revelamos todos sus objetivos
    // (los delays escalonados dan el efecto uno-tras-otro).
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animated.forEach((elTarget) => elTarget.classList.add('reveal-in'));
          this.observer?.disconnect();
          break;
        }
      }
    }, { threshold: this.revealThreshold });
    this.observer.observe(host);
  }

  ngOnDestroy() { this.observer?.disconnect(); }
}
