import { Component, Input, Output, EventEmitter, signal, OnInit, DoCheck, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { GiftsConfig, GlobalTextStyles, SectionStyle, CardStyle, GiftsParticlesConfig, ElementPosition, ElementPositions } from '../../../core/models/models';
import { HeadingOrnamentComponent } from '../../components/heading-ornament.component';
import { DragBoxComponent } from '../../../core/components/drag-box.component';

@Component({
  selector: 'app-landing-gifts',
  standalone: true,
  imports: [CommonModule, HeadingOrnamentComponent, DragBoxComponent],
  template: `
    <section id="gifts" class="landing-section gifts-section">
      <!-- Partículas decorativas de toda la sección (motor de la Intro + tipos temáticos emoji). -->
      @if (particlesConfig.enabled) {
        <div class="gifts-particles" [attr.data-type]="particlesConfig.type" [attr.data-dir]="particlesConfig.direction">
          @for (p of particles; track $index) {
            @if (isEmojiParticle) {
              <span class="particle particle-emoji" [style]="p">{{ emojiFor(particlesConfig.type) }}</span>
            } @else {
              <span class="particle" [style]="p"></span>
            }
          }
        </div>
      }

      <div class="section-container" [class.canvas-desktop]="fgDesktop" [class.canvas-mobile]="fgMobile" [class.positioned]="hasAnyPosition()" data-drag-bounds>
        @if (headingText()) {
          <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [widthOnly]="true" [position]="posData('heading')" [ngStyle]="pos('heading')"
                        (positionChange)="onPosChange('heading',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
          @if (hasOrnament() && getOrnamentPosition() !== 'sides') {
            <div class="section-header-block">
              @if (getOrnamentPosition() === 'above' || getOrnamentPosition() === 'both') {
                <app-heading-ornament [type]="getOrnamentType()" [color]="getOrnamentColor()" [size]="getOrnamentSize()" />
              }
              <h2 class="section-heading"
                  [style.font-family]="headingFont()" [style.font-size]="headingSize()"
                  [style.background-image]="useHeadingGradient() ? getHeadingGradient() : null"
                  [class.gradient-text]="useHeadingGradient()"
                  [style.color]="!useHeadingGradient() ? headingColor() : null"
              >{{ headingText() }}</h2>
              @if (getOrnamentPosition() === 'below' || getOrnamentPosition() === 'both') {
                <app-heading-ornament [type]="getOrnamentType()" [color]="getOrnamentColor()" [size]="getOrnamentSize()" />
              }
            </div>
          } @else {
            <div class="section-header">
              <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
              <h2 class="section-heading"
                  [style.font-family]="headingFont()" [style.font-size]="headingSize()"
                  [style.background-image]="useHeadingGradient() ? getHeadingGradient() : null"
                  [class.gradient-text]="useHeadingGradient()"
                  [style.color]="!useHeadingGradient() ? headingColor() : null"
              >{{ headingText() }}</h2>
              <div class="section-line" [style.background]="getSeparatorBg()" [style.height]="getSeparatorHeight()"></div>
            </div>
          }
          </app-drag-box>
        }

        <!-- ===== DESCRIPCIÓN DE LA SECCIÓN (debajo del encabezado, arrastrable) ===== -->
        @if (hasGiftsDescription()) {
          <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [widthOnly]="true" [position]="posData('description')" [ngStyle]="pos('description')"
                        (positionChange)="onPosChange('description',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
            <div class="gifts-section-desc"
                 [style.--dc-font]="contentFont()" [style.--dc-size]="contentSize()" [style.--dc-color]="contentColor()"
                 [innerHTML]="safeGiftsDesc()"></div>
          </app-drag-box>
        }

        <!-- ===== CARD MESA DE REGALOS ===== -->
        <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [widthOnly]="true" [position]="posData('giftsCard')" [ngStyle]="pos('giftsCard')"
                      (positionChange)="onPosChange('giftsCard',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
        <div class="gifts-card reveal" [class.no-bg]="getShowCardBg() === false" [style.border-radius]="getCardBorderRadius()" [style.--card-bg-opacity]="1" [style.border-style]="getCardBorderStyle()" [style.border-width.px]="getCardBorderWidth()" [style.box-shadow]="getCardBoxShadow()" [style.--card-bg]="getCardBgColor()" [style.border-color]="getCardBorderColor()" [class.neon-border]="getIsNeon()">
          @if (getGiftsIcon(); as icon) {
            <div class="gifts-icon-wrap" [style.--gifts-icon-scale]="iconScale(config.iconSize)">
              @if (icon.type === 'material') {
                <span class="material-icons gifts-icon">{{ icon.value }}</span>
              } @else if (icon.type === 'emoji') {
                <span class="gifts-icon emoji">{{ icon.value }}</span>
              } @else {
                <img [src]="icon.value" class="gifts-icon-img" alt="">
              }
            </div>
          }
          @if (config.cardTitle) {
            <h3 class="gifts-card-title"
                [style.font-family]="titleFont()" [style.font-size]="titleSize()" [style.font-weight]="titleWeight()"
                [style.background-image]="useTitleGradient() ? getTitleGradient() : null"
                [class.gradient-text]="useTitleGradient()"
                [style.color]="!useTitleGradient() ? titleColor() : null"
            >{{ config.cardTitle }}</h3>
          }
          @if (config.link) {
            <a [href]="config.link" target="_blank" class="gifts-btn" [ngStyle]="giftsBtnStyle()">
              <span class="material-icons">open_in_new</span>
              {{ config.buttonText || 'Ver Lista de Regalos' }}
            </a>
          }
        </div>
        </app-drag-box>

        <!-- ===== CARD TRANSFERENCIA (COMPACTA): icono + descripción + botón ===== -->
        @if (config.transfer?.enabled) {
          <app-drag-box [editable]="editable" [maxSize]="100" [posMargin]="0" [widthOnly]="true" [position]="posData('transferCard')" [ngStyle]="pos('transferCard')"
                        (positionChange)="onPosChange('transferCard',$event)" (draggingChange)="dragging = $event" (guidesChange)="guides = $event">
          <div class="transfer-card reveal" [class.no-bg]="getTShowCardBg() === false" [style.border-radius]="getTCardBorderRadius()" [style.--card-bg-opacity]="1" style="animation-delay:0.2s" [style.border-style]="getTCardBorderStyle()" [style.border-width.px]="getTCardBorderWidth()" [style.box-shadow]="getTCardBoxShadow()" [style.--card-bg]="getTCardBgColor()" [style.border-color]="getTCardBorderColor()" [class.neon-border]="getTIsNeon()">
            <div class="transfer-content">
              @if (getTransferIcon(); as icon) {
                <div class="transfer-icon-wrap" [style.--gifts-icon-scale]="iconScale(config.transfer.iconSize)">
                  @if (icon.type === 'material') {
                    <span class="material-icons transfer-icon">{{ icon.value }}</span>
                  } @else if (icon.type === 'emoji') {
                    <span class="transfer-icon emoji">{{ icon.value }}</span>
                  } @else {
                    <img [src]="icon.value" class="transfer-icon-img" alt="">
                  }
                </div>
              }
              @if (config.transfer.title) {
                <h3 class="transfer-card-title"
                    [style.font-family]="tTitleFont()" [style.font-size]="tTitleSize()" [style.font-weight]="tTitleWeight()"
                    [style.background-image]="useTTitleGradient() ? getTTitleGradient() : null"
                    [class.gradient-text]="useTTitleGradient()"
                    [style.color]="!useTTitleGradient() ? tTitleColor() : null"
                >{{ config.transfer.title }}</h3>
              }
              <button class="gifts-btn" [ngStyle]="transferBtnStyle()" (click)="openTransferModal()">
                <span class="material-icons">account_balance</span>
                {{ config.transfer.buttonText || 'Ver datos bancarios' }}
              </button>
            </div>
          </div>
          </app-drag-box>
        }

        @if (editable && dragging && guides) {
          @if (guides.x !== undefined) { <div class="ad-guide ad-guide-v" [style.left.%]="guides.x"></div> }
          @if (guides.y !== undefined) { <div class="ad-guide ad-guide-h" [style.top.%]="guides.y"></div> }
        }
      </div>
    </section>

    <!-- ===== MODAL DE DATOS BANCARIOS ===== -->
    @if (transferModalOpen()) {
      <div class="gifts-modal-overlay" (click)="closeTransferModal()">
        <div class="gifts-modal" (click)="$event.stopPropagation()"
             [style.border-radius]="getTCardBorderRadius()" [style.border-style]="getTCardBorderStyle()"
             [style.border-width.px]="getTCardBorderWidth()" [style.box-shadow]="getTCardBoxShadow()"
             [style.--card-bg]="getTCardBgColor()" [style.border-color]="getTCardBorderColor()"
             [class.neon-border]="getTIsNeon()">
          <button class="gifts-modal-close" (click)="closeTransferModal()"><span class="material-icons">close</span></button>
          @if (config.transfer.title) {
            <h3 class="transfer-card-title"
                [style.font-family]="tTitleFont()" [style.font-size]="tTitleSize()" [style.font-weight]="tTitleWeight()"
                [style.background-image]="useTTitleGradient() ? getTTitleGradient() : null"
                [class.gradient-text]="useTTitleGradient()"
                [style.color]="!useTTitleGradient() ? tTitleColor() : null"
            >{{ config.transfer.title }}</h3>
          }
          <div class="transfer-data">
            <!-- Titular -->
            @if (config.transfer.accountName) {
              <div class="transfer-row">
                <div class="transfer-label">Titular</div>
                <div class="transfer-value-row">
                  <span class="transfer-value">{{ config.transfer.accountName }}</span>
                  <button class="copy-btn" (click)="copyToClipboard(config.transfer.accountName)" [title]="'Copiar nombre'">
                    <span class="material-icons">{{ copied() === 'name' ? 'check' : 'content_copy' }}</span>
                  </button>
                </div>
              </div>
            }
            <!-- Banco -->
            @if (config.transfer.bank) {
              <div class="transfer-row">
                <div class="transfer-label">Banco</div>
                <div class="transfer-value">{{ config.transfer.bank }}</div>
              </div>
            }
            <!-- Tipo / Número -->
            @if (config.transfer.accountNumber) {
              <div class="transfer-row">
                <div class="transfer-label">{{ accountTypeLabel }}</div>
                <div class="transfer-value-row">
                  <span class="transfer-value transfer-number">{{ config.transfer.accountNumber }}</span>
                  <button class="copy-btn" (click)="copyToClipboard(config.transfer.accountNumber, 'number')" [title]="'Copiar número'">
                    <span class="material-icons">{{ copied() === 'number' ? 'check' : 'content_copy' }}</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .gifts-section { padding: 80px 20px; position: relative; overflow: hidden; min-height: var(--canvas-vh, 100svh); display: flex; flex-direction: column; justify-content: safe center; }
    .section-container { max-width: 700px; margin: 0 auto; text-align: center; position: relative; z-index: 2; width: 100%; }
    /* Modo posicionado (drag): el contenedor es el LIENZO (data-drag-bounds) con alto FIJO = ventana,
       acotado a ancho fijo por dispositivo centrado. La SECCIÓN crece por JS (installAutoHeight). */
    .section-container.positioned { position: absolute; top: 48px; left: 50%; height: calc(var(--canvas-vh, 100svh) - 96px); max-width: none; margin: 0; transform: translateX(-50%); }
    .section-container.positioned.canvas-desktop { width: var(--canvas-desktop-w, 600px); }
    .section-container.positioned.canvas-mobile { width: var(--canvas-mobile-w, 360px); }
    .ad-guide { position: absolute; z-index: 50; pointer-events: none; }
    .ad-guide-v { top: 0; bottom: 0; width: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateX(-50%); }
    .ad-guide-h { left: 0; right: 0; height: 1px; background: rgba(157,110,231,0.9); box-shadow: 0 0 4px rgba(157,110,231,0.6); transform: translateY(-50%); }
    /* En positioned, el drag-box y su frame usan alto natural (no recortan la card). */
    .section-container.positioned ::ng-deep app-drag-box { height: auto; }
    .section-container.positioned ::ng-deep app-drag-box .db-frame { height: auto; }
    .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-header-block { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 32px; text-align: center; }
    .section-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent); }
    /* Sin nowrap: el encabezado hace salto de línea si no cabe, y nunca se sale de la pantalla
       (overflow-wrap parte palabras muy largas). Centrado por el flex del header. */
    .section-heading { font-family: var(--font-script); font-size: clamp(28px, 5vw, 42px); color: var(--gold); text-align: center; overflow-wrap: break-word; word-break: break-word; max-width: 100%; }
    .section-heading.gradient-text { -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; }

    .gifts-card, .transfer-card {
      position: relative; overflow: visible;
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.25));
      border-radius: 16px; padding: 40px; margin-bottom: 20px;
      /* Flex column centrado: icono/título/descripción/botón SIEMPRE apilados y centrados,
         con o sin descripción (antes, sin descripción, el título quedaba en línea con el botón). */
      display: flex; flex-direction: column; align-items: center; text-align: center;
      &::before { content:''; position:absolute; inset:0; border-radius:inherit; background:var(--card-bg, var(--theme-card-bg, rgba(0,0,0,0.85))); opacity:var(--card-bg-opacity, 1); z-index:0; pointer-events:none; }
      & > * { position:relative; z-index:1; }
      &.no-bg { border-color: transparent; border-style: none !important; &::before { opacity: 0; } }
      &.neon-border { animation: neonPulse 2s ease-in-out infinite alternate; }
    }
    /* El contenido de la transfer (icono/título/desc/botón) también apilado y centrado. */
    .transfer-content { display: flex; flex-direction: column; align-items: center; width: 100%; }
    @keyframes neonPulse { from { filter: brightness(1); } to { filter: brightness(1.3); } }

    .gifts-icon-wrap, .transfer-icon-wrap { display: block; margin-bottom: 16px; }
    .gifts-icon, .transfer-icon { font-size: calc(56px * var(--gifts-icon-scale, 1)); color: var(--theme-text-primary, var(--gold)); display: block; }
    .gifts-icon.emoji, .transfer-icon.emoji { font-size: calc(56px * var(--gifts-icon-scale, 1)); opacity: 1; font-style: normal; }
    .gifts-icon-img, .transfer-icon-img { width: calc(72px * var(--gifts-icon-scale, 1)); height: calc(72px * var(--gifts-icon-scale, 1)); object-fit: contain; margin: 0 auto; display: block; }

    .gifts-card-title, .transfer-card-title { font-family: var(--font-serif); font-size: 22px; color: var(--theme-nav-text, var(--gold)); margin-bottom: 8px; line-height: 1.4; padding: 0.1em 0; }
    .gifts-card-title.gradient-text, .transfer-card-title.gradient-text { -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: inline-block; }

    /* Descripción ÚNICA de la sección (debajo del encabezado, fuera de las cards). */
    .gifts-section-desc {
      line-height: 1.7; white-space: normal; margin: 0 auto 28px; text-align: center; max-width: 100%;
      font-family: var(--dc-font, inherit); font-size: var(--dc-size, 15px); color: var(--dc-color, rgba(255,255,255,0.7));
    }
    .gifts-section-desc p { margin: 0 0 8px; }
    .gifts-section-desc p:last-child { margin-bottom: 0; }

    .gifts-btn {
      display: inline-flex; align-items: center; gap: 10px; cursor: pointer;
      background: var(--theme-btn-bg, linear-gradient(135deg, var(--gold), var(--gold-light)));
      color: var(--theme-btn-text, #1a1a2e); font-weight: 700; font-size: 15px;
      padding: 14px 32px; border-radius: 30px; text-decoration: none; border: none;
      transition: all 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      .material-icons { font-size: 18px; }
      &:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
    }

    /* ===== MODAL ===== */
    .gifts-modal-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
      animation: giftsModalFade 0.25s ease both;
    }
    .gifts-modal {
      position: relative; width: 100%; max-width: 420px;
      border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 16px; padding: 36px 28px 28px; text-align: center;
      animation: giftsModalScale 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
      &::before { content:''; position:absolute; inset:0; border-radius:inherit; background:var(--card-bg, var(--theme-card-bg, rgba(20,20,30,0.98))); z-index:0; pointer-events:none; }
      & > * { position:relative; z-index:1; }
      &.neon-border { animation: giftsModalScale 0.3s cubic-bezier(0.34,1.56,0.64,1) both, neonPulse 2s ease-in-out infinite alternate; }
    }
    .gifts-modal-close {
      position: absolute; top: 10px; right: 10px; z-index: 2;
      width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
      background: var(--theme-card-bg, rgba(255,255,255,0.1)); color: var(--theme-text-primary, var(--gold));
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
      .material-icons { font-size: 20px; }
      &:hover { background: var(--theme-card-border, rgba(212,160,23,0.3)); }
    }
    @keyframes giftsModalFade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes giftsModalScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

    .transfer-data {
      background: var(--theme-card-bg, rgba(255,255,255,0.03)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.2));
      border-radius: 12px; padding: 20px; text-align: left; margin-top: 16px;
    }
    .transfer-row {
      padding: 12px 0;
      border-bottom: 1px solid var(--theme-card-border, rgba(255,255,255,0.06));
      &:last-child { border-bottom: none; }
    }
    .transfer-label { font-size: 11px; color: var(--theme-text-secondary, rgba(255,255,255,0.4)); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .transfer-value-row { display: flex; align-items: center; gap: 8px; }
    .transfer-value { font-size: 15px; color: var(--theme-text-primary, rgba(255,255,255,0.9)); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
    .transfer-number { font-family: 'Courier New', monospace; letter-spacing: 0.5px; color: var(--theme-text-primary, var(--gold)); font-weight: 600; word-break: break-all; white-space: normal; overflow-wrap: break-word; }
    .copy-btn {
      background: var(--theme-card-bg, rgba(212,160,23,0.15)); border: 1px solid var(--theme-card-border, rgba(212,160,23,0.3));
      border-radius: 8px; padding: 8px 12px; cursor: pointer; flex-shrink: 0;
      color: var(--theme-text-primary, var(--gold)); transition: all 0.2s; display: flex; align-items: center;
      .material-icons { font-size: 18px; }
      &:hover { background: var(--theme-card-border, rgba(212,160,23,0.3)); }
      &:active { transform: scale(0.95); }
    }

    /* ===== PARTÍCULAS DE SECCIÓN (motor de la Intro) ===== */
    .gifts-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 1; }
    .particle { position: absolute; border-radius: 50%; opacity: 0; }
    .particle-emoji { border-radius: 0; display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
    [data-type="sparkles"] .particle { animation: gParticleUp linear infinite; }
    [data-type="snow"] .particle { animation: gParticleDown linear infinite; }
    [data-type="fireflies"] .particle { animation: gParticleFirefly ease-in-out infinite; }
    [data-type="bubbles"] .particle { animation: gParticleBubble ease-in infinite; }
    [data-type="stars"] .particle { animation: gParticleStar ease-in-out infinite; }
    [data-type="confetti"] .particle { border-radius: 2px; animation: gParticleConfetti linear infinite; }
    /* Tipos temáticos (emoji): caída suave con leve rotación, como el confeti pero sin recortar. */
    [data-type="flowers"] .particle, [data-type="gifts"] .particle, [data-type="bows"] .particle,
    [data-type="hearts"] .particle, [data-type="bills"] .particle, [data-type="coins"] .particle {
      border-radius: 0; animation: gParticleEmoji linear infinite;
    }
    @keyframes gParticleUp {
      0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.5); }
      5% { opacity: var(--particle-opacity, 0.8); }
      80% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); }
      100% { opacity: 0; transform: translateY(-100vh) translateX(var(--drift, 0px)) scale(1); }
    }
    @keyframes gParticleDown {
      0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.5); }
      5% { opacity: var(--particle-opacity, 0.8); }
      80% { opacity: calc(var(--particle-opacity, 0.8) * 0.5); }
      100% { opacity: 0; transform: translateY(100vh) translateX(var(--drift, 20px)) scale(1); }
    }
    @keyframes gParticleFirefly {
      0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
      10% { opacity: var(--particle-opacity, 0.8); }
      50% { opacity: calc(var(--particle-opacity, 0.8) * 0.4); transform: translate(calc(var(--drift, 30px) * -1), -30vh) scale(0.7); }
      75% { opacity: var(--particle-opacity, 0.8); transform: translate(var(--drift, 30px), -45vh) scale(1); }
      100% { opacity: 0; transform: translate(0, -60vh) scale(0.5); }
    }
    @keyframes gParticleBubble {
      0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.4); }
      10% { opacity: var(--particle-opacity, 0.8); transform: translateY(-8vh) translateX(var(--drift, 10px)) scale(0.8); }
      70% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); transform: translateY(-60vh) translateX(var(--drift, 10px)) scale(0.9); }
      100% { opacity: 0; transform: translateY(-90vh) scale(0.6); }
    }
    @keyframes gParticleStar {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      50% { opacity: var(--particle-opacity, 0.8); transform: scale(1.2); }
    }
    @keyframes gParticleConfetti {
      0% { opacity: 0; transform: translateY(0) rotate(0deg) scale(1); }
      10% { opacity: var(--particle-opacity, 0.8); }
      90% { opacity: calc(var(--particle-opacity, 0.8) * 0.6); }
      100% { opacity: 0; transform: translateY(100vh) rotate(var(--rotation, 720deg)) scale(0.5); }
    }
    @keyframes gParticleEmoji {
      0% { opacity: 0; transform: translateY(-5%) translateX(0) rotate(0deg) scale(0.8); }
      10% { opacity: var(--particle-opacity, 0.85); }
      90% { opacity: calc(var(--particle-opacity, 0.85) * 0.7); }
      100% { opacity: 0; transform: translateY(100vh) translateX(var(--drift, 20px)) rotate(var(--rotation, 180deg)) scale(1); }
    }

    .reveal { animation: revealUp 0.8s ease both; }
    @keyframes revealUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LandingGiftsComponent implements OnInit, DoCheck, AfterViewInit, OnDestroy {
  @Input() config!: GiftsConfig;
  @Input() styles?: GlobalTextStyles;
  @Input() sectionStyle?: SectionStyle;
  @Input() editable = false;
  @Input() previewDevice: 'mobile' | 'desktop' | null = null;
  @Output() positionsChange = new EventEmitter<ElementPositions>();

  private sanitizer = inject(DomSanitizer);
  private host = inject(ElementRef);

  dragging = false;
  guides: { x?: number; y?: number } | null = null;

  // ===== Drag (posición + ancho; alto por contenido, como Vestimenta) =====
  private get isMobilePos(): boolean {
    if (this.previewDevice) return this.previewDevice === 'mobile';
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }
  get fgDesktop(): boolean { return !this.isMobilePos; }
  get fgMobile(): boolean { return this.isMobilePos; }

  private readonly POS_KEYS = ['heading', 'description', 'giftsCard', 'transferCard'];
  private readonly DEFAULT_POS: Record<string, ElementPosition> = {
    heading: { x: 50, y: 10 },
    description: { x: 50, y: 20, w: 90 },
    giftsCard: { x: 50, y: 45, w: 92 },
    transferCard: { x: 50, y: 80, w: 92 },
  };
  hasAnyPosition(): boolean {
    const p = this.config.positions;
    if (!p) return false;
    return (!!p.desktop && Object.keys(p.desktop).length > 0) || (!!p.mobile && Object.keys(p.mobile).length > 0);
  }
  private resolvePos(key: string): ElementPosition {
    const p = this.config.positions;
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const other = this.isMobilePos ? 'desktop' : 'mobile';
    return p?.[dev]?.[key] ?? p?.[other]?.[key] ?? this.DEFAULT_POS[key] ?? { x: 50, y: 50 };
  }
  pos(key: string): Record<string, string> {
    if (!this.hasAnyPosition()) return {};
    const r = this.resolvePos(key);
    const style: Record<string, string> = {
      position: 'absolute', left: r.x + '%', top: r.y + '%',
      right: 'auto', bottom: 'auto', transform: 'translateX(-50%)', margin: '0',
    };
    if (r.w != null) style['width'] = r.w + '%';
    else if (key !== 'heading') style['width'] = '92%';
    else style['width'] = 'max-content';
    return style;
  }
  posData(key: string): ElementPosition | null {
    if (!this.hasAnyPosition()) return null;
    return this.resolvePos(key);
  }
  onPosChange(key: string, pos: ElementPosition) {
    const dev = this.isMobilePos ? 'mobile' : 'desktop';
    const positions: ElementPositions = {
      desktop: { ...(this.config.positions?.desktop || {}) },
      mobile: { ...(this.config.positions?.mobile || {}) },
    };
    if (!this.hasAnyPosition()) {
      for (const k of this.POS_KEYS) {
        if (k === 'heading' && !this.headingText()) continue;
        if (k === 'description' && !this.hasGiftsDescription()) continue;
        if (k === 'transferCard' && !this.config.transfer?.enabled) continue;
        positions[dev]![k] = { ...this.resolvePos(k) };
      }
    }
    positions[dev]![key] = pos;
    this.config.positions = positions;
    this.positionsChange.emit(positions);
  }

  // ===== Auto-alto: la sección crece con el contenido posicionado (como Vestimenta) =====
  private autoHeightObserver?: ResizeObserver;
  ngAfterViewInit() { this.installAutoHeight(); }
  ngOnDestroy() { this.autoHeightObserver?.disconnect(); }
  private installAutoHeight() {
    if (typeof ResizeObserver === 'undefined') return;
    const section = this.host.nativeElement.querySelector('.gifts-section') as HTMLElement | null;
    const inner = this.host.nativeElement.querySelector('.section-container') as HTMLElement | null;
    if (!section || !inner) return;
    const recalc = () => {
      if (!inner.classList.contains('positioned')) { section.style.minHeight = ''; return; }
      const cssVh = getComputedStyle(section).getPropertyValue('--canvas-vh').trim();
      const base = cssVh ? parseFloat(cssVh) : inner.clientHeight;
      if (!base) return;
      // Punto más bajo de los objetos posicionados (tope% del lienzo + alto natural).
      let maxBottom = 0;
      const boxes = this.host.nativeElement.querySelectorAll('.section-container app-drag-box') as NodeListOf<HTMLElement>;
      boxes.forEach((b) => {
        const topPct = parseFloat(b.style.top || '0') || 0;
        const topPx = 48 + (topPct / 100) * base;
        maxBottom = Math.max(maxBottom, topPx + b.offsetHeight);
      });
      const needed = Math.ceil(maxBottom + 48);
      const target = Math.max(Math.round(base), needed);
      const current = parseFloat(section.style.minHeight || '0') || 0;
      if (Math.abs(target - current) > 1) section.style.minHeight = target + 'px';
    };
    this.autoHeightObserver = new ResizeObserver(() => recalc());
    const boxes = this.host.nativeElement.querySelectorAll('.section-container app-drag-box') as NodeListOf<HTMLElement>;
    boxes.forEach((b) => this.autoHeightObserver!.observe(b));
    recalc();
  }

  // ===== Encabezado de sección =====
  headingText(): string { return (this.config.title ?? '').trim(); }

  hasOrnament(): boolean { return !!this.sectionStyle?.headingOrnament && this.sectionStyle.headingOrnament.type !== 'none'; }
  getOrnamentType(): string { return this.sectionStyle?.headingOrnament?.type || 'none'; }
  getOrnamentPosition(): string { return this.sectionStyle?.headingOrnament?.position || 'below'; }
  getOrnamentColor(): string { return this.sectionStyle?.headingOrnament?.color || this.styles?.separatorStyle?.color || '#d4a017'; }
  getOrnamentSize(): number { return this.sectionStyle?.headingOrnament?.size || 1; }

  // Encabezado (h2) con bicolor por sectionStyle (fallback tema).
  headingColor(): string { return this.sectionStyle?.sectionHeadingColor || this.styles?.sectionHeadingStyle?.color || '#d4a017'; }
  headingFont(): string { return this.getFontFamily(this.sectionStyle?.sectionHeadingFont || this.styles?.sectionHeadingStyle?.fontFamily); }
  headingSize(): string { return `${this.sectionStyle?.sectionHeadingSize || this.styles?.sectionHeadingStyle?.fontSize || 36}px`; }
  useHeadingGradient(): boolean { return !!this.sectionStyle?.sectionHeadingColor2; }
  getHeadingGradient(): string {
    const c1 = this.sectionStyle?.sectionHeadingColor || this.styles?.sectionHeadingStyle?.color || '#d4a017';
    const c2 = this.sectionStyle?.sectionHeadingColor2;
    if (!c2) return 'none';
    const angle = this.sectionStyle?.sectionHeadingGradientAngle ?? 135;
    const v = Math.max(0, Math.min(100, this.sectionStyle?.sectionHeadingGradientIntensity ?? 50));
    const mid = 100 - v; const a = Math.max(0, mid - 25); const b = Math.min(100, mid + 25);
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${a}%, ${c2} ${b}%, ${c2} 100%)`;
  }

  // Título de la card Mesa de Regalos (bicolor por sectionStyle.heading*).
  titleColor(): string { return this.sectionStyle?.headingColor || this.styles?.titleStyle?.color || '#d4a017'; }
  titleFont(): string { return this.getFontFamily(this.sectionStyle?.headingFont || this.styles?.titleStyle?.fontFamily); }
  titleSize(): string { return `${this.sectionStyle?.headingFontSize || this.styles?.titleStyle?.fontSize || 22}px`; }
  titleWeight(): string { return `${this.sectionStyle?.headingFontWeight || this.styles?.titleStyle?.fontWeight || 400}`; }
  useTitleGradient(): boolean {
    if (this.sectionStyle?.headingColor2) return true;
    if (this.sectionStyle?.headingColor) return false;
    return !!this.styles?.titleStyle?.color2;
  }
  getTitleGradient(): string {
    const g = this.styles?.titleStyle;
    const c1 = this.sectionStyle?.headingColor ?? g?.color ?? '#d4a017';
    const c2 = this.sectionStyle?.headingColor2 ?? g?.color2;
    if (!c2) return 'none';
    const angle = this.sectionStyle?.headingGradientAngle ?? g?.gradientAngle ?? 135;
    const v = Math.max(0, Math.min(100, this.sectionStyle?.headingGradientIntensity ?? g?.gradientIntensity ?? 50));
    const mid = 100 - v; const a = Math.max(0, mid - 25); const b = Math.min(100, mid + 25);
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${a}%, ${c2} ${b}%, ${c2} 100%)`;
  }

  // Título de la card Transferencia: estilo PROPIO (transfer.titleStyle) con fallback al del tema.
  private tts() { return this.config.transfer?.titleStyle || {}; }
  tTitleColor(): string { return this.tts().color || this.styles?.titleStyle?.color || '#d4a017'; }
  tTitleFont(): string { return this.getFontFamily(this.tts().font || this.styles?.titleStyle?.fontFamily); }
  tTitleSize(): string { return `${this.tts().size || this.styles?.titleStyle?.fontSize || 22}px`; }
  tTitleWeight(): string { return `${this.tts().fontWeight || this.styles?.titleStyle?.fontWeight || 400}`; }
  useTTitleGradient(): boolean {
    const t = this.tts();
    if (t.color2) return true;
    if (t.color) return false;
    return !!this.styles?.titleStyle?.color2;
  }
  getTTitleGradient(): string {
    const t = this.tts(); const g = this.styles?.titleStyle;
    const c1 = t.color ?? g?.color ?? '#d4a017';
    const c2 = t.color2 ?? g?.color2;
    if (!c2) return 'none';
    const angle = t.gradientAngle ?? g?.gradientAngle ?? 135;
    const v = Math.max(0, Math.min(100, t.gradientIntensity ?? g?.gradientIntensity ?? 50));
    const mid = 100 - v; const a = Math.max(0, mid - 25); const b = Math.min(100, mid + 25);
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c1} ${a}%, ${c2} ${b}%, ${c2} 100%)`;
  }

  // ===== Estilo de botones (fondo/texto/borde/radio; fallback al tema) =====
  giftsBtnStyle(): Record<string, string | null> {
    const b = this.config.buttonStyle || {};
    return {
      'background': b.bgColor || null, 'color': b.textColor || null,
      'border-color': b.borderColor || null, 'border-style': b.borderColor ? 'solid' : null,
      'border-width': b.borderColor ? '1px' : null,
      'border-radius': b.borderRadius != null ? b.borderRadius + 'px' : null,
    };
  }
  transferBtnStyle(): Record<string, string | null> {
    const b = this.config.transfer?.buttonStyle || {};
    return {
      'background': b.bgColor || null, 'color': b.textColor || null,
      'border-color': b.borderColor || null, 'border-style': b.borderColor ? 'solid' : null,
      'border-width': b.borderColor ? '1px' : null,
      'border-radius': b.borderRadius != null ? b.borderRadius + 'px' : null,
    };
  }

  // Contenido (descripción) con estilo por sección.
  contentColor(): string { return this.sectionStyle?.contentColor || this.styles?.contentStyle?.color || 'rgba(255,255,255,0.7)'; }
  contentFont(): string { return this.getFontFamily(this.sectionStyle?.contentFont || this.styles?.contentStyle?.fontFamily); }
  contentSize(): string { return `${this.sectionStyle?.contentFontSize || this.styles?.contentStyle?.fontSize || 15}px`; }

  // ===== Descripciones enriquecidas =====
  private _safeCache = new Map<string, SafeHtml>();
  private safe(h: string): SafeHtml {
    if (!this._safeCache.has(h)) this._safeCache.set(h, this.sanitizer.bypassSecurityTrustHtml(h));
    return this._safeCache.get(h)!;
  }
  hasGiftsDescription(): boolean { return !!((this.config.descriptionHtml && this.config.descriptionHtml.trim()) || (this.config.description && this.config.description.trim())); }
  safeGiftsDesc(): SafeHtml { return this.safe((this.config.descriptionHtml && this.config.descriptionHtml.trim()) ? this.config.descriptionHtml : (this.config.description || '')); }
  hasTransferDescription(): boolean { const t = this.config.transfer; return !!((t?.descriptionHtml && t.descriptionHtml.trim()) || (t?.description && t.description.trim())); }
  safeTransferDesc(): SafeHtml { const t = this.config.transfer; return this.safe((t?.descriptionHtml && t.descriptionHtml.trim()) ? t.descriptionHtml! : (t?.description || '')); }

  getFontFamily(key?: string): string {
    const m: Record<string,string> = {'sans':'var(--font-sans)','serif':'var(--font-serif)','script':'var(--font-script)','cormorant':'var(--font-cormorant)','spumoni':'var(--font-spumoni)','dancing':'var(--font-dancing)','montserrat':'var(--font-montserrat)','raleway':'var(--font-raleway)','cinzel':'var(--font-cinzel)','sacramento':'var(--font-sacramento)','tangerine':'var(--font-tangerine)','alexbrush':'var(--font-alexbrush)','pinyon':'var(--font-pinyon)','aura':'var(--font-aura)','allura':'var(--font-allura)','josefin':'var(--font-josefin)','baskerville':'var(--font-baskerville)'};
    return m[key||'sans']||'var(--font-sans)';
  }
  getSeparatorBg(): string {
    const c=this.styles?.separatorStyle?.color||'#d4a017',t=this.styles?.separatorStyle?.type||'elegant';
    switch(t){case 'formal':return c;case 'executive':return `linear-gradient(180deg,${c},transparent 40%,transparent 60%,${c})`;case 'festive':return `repeating-linear-gradient(90deg,${c} 0px,${c} 4px,transparent 4px,transparent 10px)`;case 'animated':return `linear-gradient(90deg,transparent,${c},transparent)`;case 'minimal':return `${c}40`;case 'ornamental':return `linear-gradient(90deg,transparent,${c}60,${c},${c}60,transparent)`;default:return `linear-gradient(90deg,transparent,${c}80,transparent)`;}
  }
  getSeparatorHeight(): string {
    const t=this.styles?.separatorStyle?.type||'elegant';
    switch(t){case 'executive':return '4px';case 'festive':return '3px';case 'ornamental':return '2px';default:return '1px';}
  }

  // ===== Iconos (estilo venues) =====
  iconScale(size?: 'small'|'medium'|'large'): number {
    switch (size) { case 'medium': return 1.15; case 'large': return 1.30; default: return 1; }
  }
  getGiftsIcon(): { type: string; value: string } | null {
    const si = this.config.sectionIcon;
    if (si?.iconType === 'none') return null;
    if (!si || si.iconType === 'material') return { type: 'material', value: 'card_giftcard' };
    if (si.iconType === 'emoji' && si.icon) return { type: 'emoji', value: si.icon };
    if (si.iconType === 'image' && si.iconUrl) return { type: 'image', value: si.iconUrl };
    return { type: 'material', value: 'card_giftcard' };
  }
  getTransferIcon(): { type: string; value: string } | null {
    const si = this.config.transfer?.sectionIcon;
    if (si?.iconType === 'none') return null;
    if (!si || si.iconType === 'material') return { type: 'material', value: 'account_balance' };
    if (si.iconType === 'emoji' && si.icon) return { type: 'emoji', value: si.icon };
    if (si.iconType === 'image' && si.iconUrl) return { type: 'image', value: si.iconUrl };
    return { type: 'material', value: 'account_balance' };
  }

  // ===== Modal de transferencia =====
  transferModalOpen = signal(false);
  copied = signal<string | null>(null);

  openTransferModal() { this.transferModalOpen.set(true); }
  closeTransferModal() { this.transferModalOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEscape() { if (this.transferModalOpen()) this.closeTransferModal(); }

  get accountTypeLabel(): string {
    switch (this.config.transfer?.accountType) {
      case 'tarjeta': return 'No. Tarjeta';
      case 'cuenta': return 'No. Cuenta';
      case 'clabe': return 'CLABE';
      default: return 'Número';
    }
  }

  copyToClipboard(text: string, key = 'name') {
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(key);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }

  // ===== Estilo de card MESA DE REGALOS (tipado via cardStyle, con fallback a campos legacy) =====
  private cs(): CardStyle { return (this.config.cardStyle || (this.config as any)) as CardStyle; }
  getShowCardBg(): boolean { return this.cs().showCardBg !== false && this.config.showCardBg !== false; }
  getCardBgColor(): string { return this.cs().cardBgColor || ''; }
  getCardBorderColor(): string { return this.cs().cardBorderColor || ''; }
  getCardBorderStyle(): string { const s = this.cs().cardBorderStyle || 'none'; return (s === 'glow' || s === 'neon') ? 'solid' : s; }
  getIsNeon(): boolean { return this.cs().cardBorderStyle === 'neon'; }
  getCardBorderWidth(): number { const cs = this.cs(); if (cs.cardBorderStyle === 'none' || !cs.cardBorderStyle) return 0; return cs.cardBorderWidth ?? 1; }
  getCardBoxShadow(): string {
    const cs = this.cs(); const color = cs.cardGlowColor || '#d4a017'; const w = cs.cardBorderWidth ?? 1;
    if (cs.cardBorderStyle === 'glow') return `0 0 ${w * 4}px ${w * 2}px ${color}, inset 0 0 ${w * 2}px ${color}`;
    if (cs.cardBorderStyle === 'neon') return `0 0 ${w * 5}px ${color}, 0 0 ${w * 10}px ${color}, 0 0 ${w * 20}px ${color}`;
    return 'none';
  }
  getCardBorderRadius(): string {
    const cs = this.cs(); const shape = cs.cardShape || 'standard'; const base = cs.cardBorderRadius ?? this.config.cardBorderRadius ?? 16;
    switch (shape) { case 'rounded': return '50px'; case 'ticket': return `${base}px`; case 'cut': return `${base}px 0 ${base}px 0`; default: return `${base}px`; }
  }

  // ===== Estilo de card/modal TRANSFERENCIA =====
  private tcs(): CardStyle { return (this.config.transfer?.cardStyle || {}) as CardStyle; }
  getTShowCardBg(): boolean { return this.tcs().showCardBg !== false; }
  getTCardBgColor(): string { return this.tcs().cardBgColor || ''; }
  getTCardBorderColor(): string { return this.tcs().cardBorderColor || ''; }
  getTCardBorderStyle(): string { const s = this.tcs().cardBorderStyle || 'none'; return (s === 'glow' || s === 'neon') ? 'solid' : s; }
  getTIsNeon(): boolean { return this.tcs().cardBorderStyle === 'neon'; }
  getTCardBorderWidth(): number { const cs = this.tcs(); if (cs.cardBorderStyle === 'none' || !cs.cardBorderStyle) return 0; return cs.cardBorderWidth ?? 1; }
  getTCardBoxShadow(): string {
    const cs = this.tcs(); const color = cs.cardGlowColor || '#d4a017'; const w = cs.cardBorderWidth ?? 1;
    if (cs.cardBorderStyle === 'glow') return `0 0 ${w * 4}px ${w * 2}px ${color}, inset 0 0 ${w * 2}px ${color}`;
    if (cs.cardBorderStyle === 'neon') return `0 0 ${w * 5}px ${color}, 0 0 ${w * 10}px ${color}, 0 0 ${w * 20}px ${color}`;
    return 'none';
  }
  getTCardBorderRadius(): string {
    const cs = this.tcs(); const shape = cs.cardShape || 'standard'; const base = cs.cardBorderRadius ?? this.config.transfer?.cardBorderRadius ?? 16;
    switch (shape) { case 'rounded': return '50px'; case 'ticket': return `${base}px`; case 'cut': return `${base}px 0 ${base}px 0`; default: return `${base}px`; }
  }

  // ===== PARTÍCULAS DE SECCIÓN (motor de la Intro + tipos temáticos emoji) =====
  particles: string[] = [];
  private lastParticlesKey = '';

  get particlesConfig(): GiftsParticlesConfig {
    return this.config.particles || {
      enabled: false, type: 'sparkles', color1: '#d4a017', color2: '#ffffff',
      direction: 'up', quantity: 20, speed: 5, size: 4, opacity: 0.8,
    };
  }
  private readonly EMOJI_TYPES = ['flowers','gifts','bows','hearts','bills','coins'];
  get isEmojiParticle(): boolean { return this.EMOJI_TYPES.includes(this.particlesConfig.type); }
  emojiFor(type: string): string {
    switch (type) {
      case 'flowers': return '🌸'; case 'gifts': return '🎁'; case 'bows': return '🎀';
      case 'hearts': return '💖'; case 'bills': return '💵'; case 'coins': return '🪙';
      default: return '✨';
    }
  }

  ngOnInit() { this.regenParticles(); }
  ngDoCheck() {
    const pc = this.particlesConfig;
    const key = `${pc.enabled}-${pc.type}-${pc.direction}-${pc.color1}-${pc.color2}-${pc.quantity}-${pc.speed}-${pc.size}-${pc.opacity}`;
    if (key !== this.lastParticlesKey) { this.lastParticlesKey = key; this.regenParticles(); }
  }
  private regenParticles() {
    const pc = this.particlesConfig;
    this.particles = pc.enabled ? this.generateParticles(pc) : [];
  }
  private generateParticles(pc: GiftsParticlesConfig): string[] {
    const count = pc.quantity || 20;
    const baseSpeed = pc.speed || 5;
    const type = pc.type || 'sparkles';
    const dir = pc.direction || 'up';
    const baseSize = pc.size || 4;
    const baseOpacity = pc.opacity ?? 0.8;
    const c1 = pc.color1 || '#d4a017';
    const c2 = pc.color2 || '#ffffff';
    const emoji = this.EMOJI_TYPES.includes(type);

    return Array.from({ length: count }, () => {
      const color = Math.random() > 0.5 ? c1 : c2;
      const delay = Math.random() * 1.5;
      const dur = (6 - baseSpeed * 0.3) + Math.random() * 3;
      const sizeVariation = baseSize * (0.6 + Math.random() * 0.8);
      const drift = (Math.random() - 0.5) * 60;
      const rotation = 180 + Math.random() * 540;

      let position = '';
      if (type === 'stars' || type === 'fireflies') {
        position = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;`;
      } else if (emoji) {
        position = `left:${Math.random() * 100}%;top:-5%;`;
      } else {
        switch (dir) {
          case 'up': position = `left:${Math.random() * 100}%;bottom:-5%;`; break;
          case 'down': position = `left:${Math.random() * 100}%;top:-5%;`; break;
          case 'left': position = `top:${Math.random() * 100}%;right:-5%;`; break;
          case 'right': position = `top:${Math.random() * 100}%;left:-5%;`; break;
        }
      }

      const common = `${position}animation-duration:${dur}s;animation-delay:${delay}s;--particle-opacity:${baseOpacity};--drift:${drift}px;--rotation:${rotation}deg;`;

      if (emoji) {
        // Tipos temáticos: tamaño en px (emoji grande), sin color de fondo.
        const px = Math.round(sizeVariation * 3.2);
        return `${common}font-size:${px}px;`;
      }

      let width = sizeVariation, height = sizeVariation, extra = '';
      if (type === 'confetti') { width = sizeVariation * 0.5; height = sizeVariation; }
      else if (type === 'bubbles') {
        const b = sizeVariation * 2.5; width = b; height = b;
        extra = `;background:transparent;border:1px solid ${color};box-shadow:inset 0 0 ${b * 0.3}px ${color}40, 0 0 ${b * 0.5}px ${color}20`;
      } else if (type === 'sparkles' || type === 'stars') {
        const g = sizeVariation * 1.5;
        extra = `;box-shadow:0 0 ${g}px ${g * 0.3}px ${color}, ${g * 0.8}px 0 ${g * 0.5}px 0 ${color}80, -${g * 0.8}px 0 ${g * 0.5}px 0 ${color}80, 0 ${g * 0.8}px ${g * 0.5}px 0 ${color}80, 0 -${g * 0.8}px ${g * 0.5}px 0 ${color}80`;
        width = sizeVariation * 0.4; height = sizeVariation * 0.4;
      } else if (type === 'fireflies') {
        extra = `;box-shadow:0 0 ${sizeVariation * 2}px ${color}`;
      }
      return `${common}width:${width}px;height:${height}px;background:${color}${extra};`;
    });
  }
}
