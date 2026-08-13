import { Injectable } from '@angular/core';

/**
 * Lightbox service: fullscreen image viewer with swipe, zoom, and navigation.
 * Renders a DOM portal on document.body to bypass any CSS containment/transform issues.
 */
@Injectable({ providedIn: 'root' })
export class LightboxService {
  private overlay: HTMLElement | null = null;
  private img: HTMLImageElement | null = null;
  private counter: HTMLElement | null = null;
  private loader: HTMLElement | null = null;
  private photos: string[] = [];
  private currentIndex = 0;
  private savedScrollY = 0;

  // Zoom/pan state
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private swipeX = 0;
  private swipeStartX = 0;
  private lastDist = 0;
  private lastX = 0;
  private lastY = 0;
  private imageLoaded = false;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;

  /**
   * Open the lightbox with a list of image URLs and starting index.
   */
  open(images: string[], startIndex = 0) {
    if (this.overlay) return;
    this.photos = images;
    this.currentIndex = startIndex;
    this.zoom = 1; this.panX = 0; this.panY = 0; this.swipeX = 0;
    this.imageLoaded = false;

    // Block scroll
    this.savedScrollY = window.scrollY;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    this.createDom();
  }

  close() {
    // Restore scroll
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    window.scrollTo(0, this.savedScrollY);
    this.destroyDom();
  }

  private createDom() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'position:absolute;top:12px;left:12px;z-index:10;width:40px;height:40px;border-radius:50%;border:none;background:rgba(0,0,0,0.5);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.4);';
    closeBtn.innerHTML = '<span class="material-icons" style="font-size:22px">close</span>';
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.close(); });
    overlay.appendChild(closeBtn);

    // Counter
    const counter = document.createElement('span');
    counter.style.cssText = 'position:absolute;top:16px;right:16px;z-index:10;color:white;font-size:14px;font-weight:600;background:rgba(0,0,0,0.4);padding:4px 10px;border-radius:12px;';
    counter.textContent = `${this.currentIndex + 1} / ${this.photos.length}`;
    overlay.appendChild(counter);
    this.counter = counter;

    // Navigation arrows (desktop + mobile visible)
    if (this.photos.length > 1) {
      const arrowCss = 'position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:44px;height:44px;border-radius:50%;border:none;background:rgba(0,0,0,0.4);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s;';
      const prev = document.createElement('button');
      prev.style.cssText = arrowCss + 'left:8px;';
      prev.innerHTML = '<span class="material-icons" style="font-size:28px">chevron_left</span>';
      prev.addEventListener('click', (e) => { e.stopPropagation(); this.prevPhoto(); });
      overlay.appendChild(prev);

      const next = document.createElement('button');
      next.style.cssText = arrowCss + 'right:8px;';
      next.innerHTML = '<span class="material-icons" style="font-size:28px">chevron_right</span>';
      next.addEventListener('click', (e) => { e.stopPropagation(); this.nextPhoto(); });
      overlay.appendChild(next);
    }

    // Loader
    const loader = document.createElement('div');
    loader.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2;pointer-events:none;';
    loader.innerHTML = '<div style="width:32px;height:32px;border:3px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;animation:lbSpin 0.7s linear infinite"></div>';
    overlay.appendChild(loader);
    this.loader = loader;

    // Keyframes
    if (!document.getElementById('lb-spin-style')) {
      const style = document.createElement('style');
      style.id = 'lb-spin-style';
      style.textContent = '@keyframes lbSpin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    // Image
    const img = document.createElement('img');
    img.style.cssText = 'max-width:94%;max-height:88%;object-fit:contain;transform-origin:center center;transition:transform 0.15s ease;opacity:0;position:relative;z-index:1;cursor:zoom-in;';
    img.src = this.photos[this.currentIndex];
    img.onload = () => { img.style.opacity = '1'; loader.style.display = 'none'; this.imageLoaded = true; };
    overlay.appendChild(img);
    this.img = img;

    // Touch events
    overlay.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    overlay.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    overlay.addEventListener('touchend', () => this.onTouchEnd());
    overlay.addEventListener('dblclick', (e) => { e.stopPropagation(); this.onDoubleTap(); });

    // Mouse wheel zoom (desktop)
    overlay.addEventListener('wheel', (e) => { e.preventDefault(); this.onWheel(e); }, { passive: false });

    // Mouse drag to pan when zoomed (desktop)
    overlay.addEventListener('mousedown', (e) => this.onMouseDown(e));
    overlay.addEventListener('mousemove', (e) => this.onMouseMove(e));
    overlay.addEventListener('mouseup', () => this.onMouseUp());
    overlay.addEventListener('mouseleave', () => this.onMouseUp());

    // Keyboard
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
      else if (e.key === 'ArrowRight') this.nextPhoto();
      else if (e.key === 'ArrowLeft') this.prevPhoto();
    };
    document.addEventListener('keydown', this.keyHandler);

    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  private destroyDom() {
    if (this.keyHandler) { document.removeEventListener('keydown', this.keyHandler); this.keyHandler = null; }
    if (this.overlay) { document.body.removeChild(this.overlay); this.overlay = null; this.img = null; this.counter = null; this.loader = null; }
    this.isDragging = false;
  }

  private nextPhoto() {
    if (this.currentIndex < this.photos.length - 1) {
      this.currentIndex++;
      this.loadCurrentPhoto();
    }
  }

  private prevPhoto() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadCurrentPhoto();
    }
  }

  private loadCurrentPhoto() {
    this.imageLoaded = false;
    this.zoom = 1; this.panX = 0; this.panY = 0; this.swipeX = 0;
    if (this.img) {
      this.img.style.opacity = '0';
      this.img.style.transform = '';
      this.img.src = this.photos[this.currentIndex];
      if (this.loader) this.loader.style.display = 'flex';
      this.img.onload = () => { this.img!.style.opacity = '1'; if (this.loader) this.loader.style.display = 'none'; this.imageLoaded = true; };
    }
    if (this.counter) this.counter.textContent = `${this.currentIndex + 1} / ${this.photos.length}`;
  }

  private updateTransform() {
    if (!this.img) return;
    if (this.zoom > 1) {
      this.img.style.transform = `scale(${this.zoom}) translate(${this.panX}px, ${this.panY}px)`;
    } else {
      this.img.style.transform = `translateX(${this.swipeX}px)`;
    }
  }

  private onDoubleTap() {
    if (this.zoom > 1) { this.zoom = 1; this.panX = 0; this.panY = 0; }
    else { this.zoom = 2.5; }
    this.updateTransform();
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    } else if (e.touches.length === 1) {
      this.swipeStartX = e.touches[0].clientX;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
      this.swipeX = 0;
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      this.zoom = Math.max(1, Math.min(5, this.zoom * (dist / this.lastDist)));
      this.lastDist = dist;
      if (this.zoom <= 1) { this.panX = 0; this.panY = 0; }
      this.updateTransform();
    } else if (e.touches.length === 1) {
      e.preventDefault();
      if (this.zoom > 1) {
        const dx = e.touches[0].clientX - this.lastX;
        const dy = e.touches[0].clientY - this.lastY;
        this.panX += dx / this.zoom;
        this.panY += dy / this.zoom;
        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
      } else {
        this.swipeX = e.touches[0].clientX - this.swipeStartX;
      }
      this.updateTransform();
    }
  }

  private onTouchEnd() {
    if (this.zoom <= 1) {
      this.panX = 0; this.panY = 0;
      if (Math.abs(this.swipeX) > 60) {
        if (this.swipeX < 0) this.nextPhoto();
        else this.prevPhoto();
      }
      this.swipeX = 0;
      this.updateTransform();
    }
  }

  // === Desktop: mouse wheel zoom + drag to pan ===
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  private onWheel(e: WheelEvent) {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(1, Math.min(5, this.zoom * delta));
    if (this.zoom <= 1) { this.panX = 0; this.panY = 0; }
    this.updateTransform();
    if (this.img) this.img.style.cursor = this.zoom > 1 ? 'grab' : '';
  }

  private onMouseDown(e: MouseEvent) {
    if (this.zoom <= 1) return;
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    if (this.img) this.img.style.cursor = 'grabbing';
    e.preventDefault();
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging || this.zoom <= 1) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.panX += dx / this.zoom;
    this.panY += dy / this.zoom;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.updateTransform();
  }

  private onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.img) this.img.style.cursor = this.zoom > 1 ? 'grab' : '';
    }
  }
}
