import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { EventConfig, ItineraryItem, DetailCard, DetailTextStyle } from '../../../core/models/models';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink],
  styles: [`
    .venue-card {
      border: 1px solid rgba(212,160,23,0.2); border-radius: 10px;
      padding: 20px; margin-bottom: 16px;
      background: rgba(255,255,255,0.02);
    }
    .venue-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .venue-icon-preview {
      width: 60px; height: 60px; border-radius: 10px;
      background: rgba(212,160,23,0.1); border: 1px solid rgba(212,160,23,0.3);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; flex-shrink: 0;
    }
    .time-ampm {
      display: flex; flex-direction: column; gap: 4px; margin-left: 4px;
      button {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 6px; padding: 4px 10px; color: rgba(255,255,255,0.5);
        cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;
        &.active { background: var(--gold); border-color: var(--gold); color: #1a1a2e; }
        &:hover:not(.active) { border-color: var(--gold); color: var(--gold); }
      }
    }
    .countdown-picker {
      display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(212,160,23,0.2);
      border-radius: 10px; padding: 16px;
    }
    .picker-group { display: flex; flex-direction: column; gap: 6px; }
    .picker-label { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px; }
    .picker-input {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 8px 12px; color: white; font-size: 14px;
      &:focus { outline: none; border-color: var(--gold); }
    }
    .time-inputs { display: flex; align-items: center; gap: 8px; }
    .time-field {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 6px 12px; min-width: 56px;
      button {
        background: none; border: none; cursor: pointer; color: var(--gold);
        padding: 0; display: flex; align-items: center; line-height: 1;
        .material-icons { font-size: 18px; }
        &:hover { color: var(--gold-light); }
      }
      small { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
    }
    .time-val { font-size: 22px; font-weight: 700; color: white; font-family: var(--font-serif); line-height: 1.2; min-width: 32px; text-align: center; }
    .time-sep { font-size: 24px; font-weight: 700; color: var(--gold); margin-bottom: 18px; }
    .picker-preview {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: rgba(255,255,255,0.6);
      background: rgba(212,160,23,0.08); border: 1px solid rgba(212,160,23,0.2);
      border-radius: 8px; padding: 8px 12px; align-self: flex-end;
    }
    .tabs-wrapper {
      display: flex; align-items: center; gap: 4px; margin-bottom: 24px;
    }
    .tabs-arrow {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 50%; width: 32px; height: 32px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--gold); transition: all 0.2s;
      .material-icons { font-size: 20px; }
      &:hover { background: rgba(212,160,23,0.15); border-color: var(--gold); }
    }
    .tabs-wrapper .tabs { margin-bottom: 0; flex: 1; min-width: 0; }
  `],
  template: `
    <div>
      <div class="flex-between mb-24">
        <div>
          <a routerLink="/dashboard/events" class="back-link">
            <span class="material-icons">arrow_back</span> Volver a Eventos
          </a>
          <h2 class="section-title">Configuración de Landing</h2>
          <p class="section-subtitle">Personaliza cada sección de tu invitación digital</p>
        </div>
        <button class="btn btn-primary" (click)="save()" [disabled]="saving()">
          <span class="material-icons">save</span> {{ saving() ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>

      @if (config()) {
        <!-- Tabs -->
        <div class="tabs-wrapper">
          <button class="tabs-arrow tabs-arrow-left" (click)="scrollTabs(-150)">
            <span class="material-icons">chevron_left</span>
          </button>
          <div class="tabs" #tabsEl>
            @for (tab of tabs; track tab.key) {
              <div class="tab" [class.active]="activeTab === tab.key" (click)="activeTab = tab.key">{{ tab.label }}</div>
            }
          </div>
          <button class="tabs-arrow tabs-arrow-right" (click)="scrollTabs(150)">
            <span class="material-icons">chevron_right</span>
          </button>
        </div>

        <!-- INTRO -->
        @if (activeTab === 'intro') {
          <div class="card">
            <h3 class="text-gold mb-16">Sección Intro</h3>
            <label class="toggle-switch mb-16">
              <input type="checkbox" [(ngModel)]="config()!.intro.enabled"><span class="toggle"></span><span>Mostrar intro animado</span>
            </label>
            <div class="grid-2">
              <div class="form-group">
                <label>Frase de bienvenida</label>
                <input type="text" [(ngModel)]="config()!.intro.phrase">
              </div>
              <div class="form-group">
                <label>Duración (segundos, máx 5)</label>
                <input type="number" [(ngModel)]="config()!.intro.duration" min="1" max="5">
              </div>
            </div>
            <div class="form-group">
              <label>Background (URL imagen/gif o subir)</label>
              <div class="flex gap-8">
                <input type="text" [(ngModel)]="config()!.intro.background" placeholder="https://... o subir archivo">
                <label class="btn btn-secondary btn-sm" style="cursor:pointer;white-space:nowrap">
                  <span class="material-icons">upload</span> Subir
                  <input type="file" accept="image/*,image/gif" (change)="uploadFile($event,'gifs','intro.background')" style="display:none">
                </label>
              </div>
              @if (config()!.intro.background) {
                <img [src]="config()!.intro.background" style="max-height:100px;margin-top:8px;border-radius:8px">
              }
            </div>
          </div>
        }

        <!-- HERO -->
        @if (activeTab === 'hero') {
          <div class="card">
            <h3 class="text-gold mb-16">Carátula / Inicio</h3>
            <div class="form-group">
              <label>Descripción del Evento (XV Años, Boda, etc.)</label>
              <input type="text" [(ngModel)]="config()!.hero.eventDescription">
            </div>
            <div class="grid-2" style="margin-bottom:16px">
              <div class="form-group">
                <label>Fuente - Descripción</label>
                <select [(ngModel)]="config()!.hero.eventDescriptionStyle.fontFamily">
                  <option value="sans">Sans (Lato)</option>
                  <option value="serif">Serif (Playfair)</option>
                  <option value="script">Script (Great Vibes)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tamaño (px) - Descripción</label>
                <input type="number" [(ngModel)]="config()!.hero.eventDescriptionStyle.fontSize" min="10" max="80" step="1">
              </div>
            </div>
            <div class="form-group" style="margin-bottom:24px">
              <label>Color de texto - Descripción</label>
              <div class="flex gap-8">
                <input type="color" [(ngModel)]="config()!.hero.eventDescriptionStyle.color">
                <input type="text" [(ngModel)]="config()!.hero.eventDescriptionStyle.color" style="max-width:120px">
              </div>
            </div>
            <div class="form-group">
              <label>Nombre(s) de Festejado(s)</label>
              <input type="text" [(ngModel)]="config()!.hero.celebrantNames" placeholder="Valeria, Gloria y Miguel">
            </div>
            <div class="grid-2" style="margin-bottom:16px">
              <div class="form-group">
                <label>Fuente - Nombres</label>
                <select [(ngModel)]="config()!.hero.celebrantNamesStyle.fontFamily">
                  <option value="sans">Sans (Lato)</option>
                  <option value="serif">Serif (Playfair)</option>
                  <option value="script">Script (Great Vibes)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tamaño (px) - Nombres</label>
                <input type="number" [(ngModel)]="config()!.hero.celebrantNamesStyle.fontSize" min="20" max="150" step="1">
              </div>
            </div>
            <div class="form-group">
              <label>Degradado de texto - Nombres</label>
              <div class="flex gap-12" style="align-items:center;flex-wrap:wrap">
                <div>
                  <small class="text-muted">Color 1</small>
                  <div class="flex gap-8" style="margin-top:4px">
                    <input type="color" [(ngModel)]="config()!.hero.celebrantNamesStyle.color1">
                    <input type="text" [(ngModel)]="config()!.hero.celebrantNamesStyle.color1" style="max-width:100px;font-size:12px">
                  </div>
                </div>
                <div>
                  <small class="text-muted">Color 2</small>
                  <div class="flex gap-8" style="margin-top:4px">
                    <input type="color" [(ngModel)]="config()!.hero.celebrantNamesStyle.color2">
                    <input type="text" [(ngModel)]="config()!.hero.celebrantNamesStyle.color2" style="max-width:100px;font-size:12px">
                  </div>
                </div>
                <div>
                  <small class="text-muted">Ángulo (°)</small>
                  <div style="margin-top:4px">
                    <input type="number" [(ngModel)]="config()!.hero.celebrantNamesStyle.gradientAngle" min="0" max="360" step="15" style="max-width:80px;font-size:12px">
                  </div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Frase breve (entre nombres y countdown)</label>
              <input type="text" [(ngModel)]="config()!.hero.heroPhrase" placeholder="Una noche mágica inspirada en un cuento">
            </div>
            <div class="grid-2" style="margin-bottom:16px">
              <div class="form-group">
                <label>Fuente - Frase</label>
                <select [(ngModel)]="config()!.hero.heroPhraseStyle.fontFamily">
                  <option value="sans">Sans (Lato)</option>
                  <option value="serif">Serif (Playfair)</option>
                  <option value="script">Script (Great Vibes)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Tamaño (px) - Frase</label>
                <input type="number" [(ngModel)]="config()!.hero.heroPhraseStyle.fontSize" min="10" max="40" step="1">
              </div>
            </div>
            <div class="form-group" style="margin-bottom:24px">
              <label>Color de texto - Frase</label>
              <div class="flex gap-8">
                <input type="color" [(ngModel)]="config()!.hero.heroPhraseStyle.color">
                <input type="text" [(ngModel)]="config()!.hero.heroPhraseStyle.color" style="max-width:120px">
              </div>
            </div>
            <div class="form-group">
              <label>Fecha y hora de la cuenta regresiva</label>
              <div class="countdown-picker">
                <div class="picker-group">
                  <label class="picker-label">Fecha</label>
                  <input type="date" [(ngModel)]="countdownDate" (ngModelChange)="updateCountdown()" class="picker-input">
                </div>
                <div class="picker-group">
                  <label class="picker-label">Hora</label>
                  <div class="time-inputs">
                    <div class="time-field">
                      <button (click)="adjustTime('h',1)"><span class="material-icons">expand_less</span></button>
                      <span class="time-val">{{ countdownHour | number:'2.0-0' }}</span>
                      <button (click)="adjustTime('h',-1)"><span class="material-icons">expand_more</span></button>
                      <small>HH</small>
                    </div>
                    <span class="time-sep">:</span>
                    <div class="time-field">
                      <button (click)="adjustTime('m',1)"><span class="material-icons">expand_less</span></button>
                      <span class="time-val">{{ countdownMin | number:'2.0-0' }}</span>
                      <button (click)="adjustTime('m',-1)"><span class="material-icons">expand_more</span></button>
                      <small>MM</small>
                    </div>
                  </div>
                </div>
                <div class="picker-preview">
                  <span class="material-icons" style="color:var(--gold);font-size:16px">event</span>
                  <span>{{ countdownPreview }}</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Background GIF/Imagen (fijo en toda la landing)</label>
              <div class="flex gap-8">
                <input type="text" [(ngModel)]="config()!.hero.backgroundGif" placeholder="URL del gif animado">
                <label class="btn btn-secondary btn-sm" style="cursor:pointer;white-space:nowrap">
                  <span class="material-icons">upload</span> Subir
                  <input type="file" accept="image/*,image/gif" (change)="uploadFile($event,'gifs','hero.backgroundGif')" style="display:none">
                </label>
              </div>
              @if (config()!.hero.backgroundGif) {
                <img [src]="config()!.hero.backgroundGif" style="max-height:100px;margin-top:8px;border-radius:8px">
              }
            </div>
            <div class="form-group">
              <label>Audio MP3 (música de fondo)</label>
              <div class="flex gap-8">
                <input type="text" [(ngModel)]="config()!.hero.audioUrl" placeholder="URL del audio mp3">
                <label class="btn btn-secondary btn-sm" style="cursor:pointer;white-space:nowrap">
                  <span class="material-icons">upload</span> Subir
                  <input type="file" accept="audio/*" (change)="uploadFile($event,'audio','hero.audioUrl')" style="display:none">
                </label>
              </div>
            </div>
          </div>
        }

        <!-- INVITATION -->
        @if (activeTab === 'invitation') {
          <div class="card">
            <h3 class="text-gold mb-16">Sección Invitación</h3>
            <div class="form-group">
              <label>Título principal</label>
              <input type="text" [(ngModel)]="config()!.invitation.title" placeholder="Están cordialmente invitados">
            </div>
            <div class="form-group">
              <label>Subtítulo</label>
              <input type="text" [(ngModel)]="config()!.invitation.subtitle">
            </div>
          </div>
        }

        <!-- DETAILS -->
        @if (activeTab === 'details') {
          <div class="card">
            <div class="flex-between mb-16">
              <div>
                <h3 class="text-gold">Sección Detalles</h3>
                <p class="text-muted" style="font-size:13px;margin-top:4px">Agrega tarjetas con información relevante (padres, padrinos, etc.)</p>
              </div>
              <div class="flex gap-8">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="config()!.details.enabled"><span class="toggle"></span><span>Visible</span>
                </label>
                <button class="btn btn-primary btn-sm" (click)="addDetailCard()">
                  <span class="material-icons">add</span> Agregar Tarjeta
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Título de la sección</label>
              <input type="text" [(ngModel)]="config()!.details.title" placeholder="Detalles del Evento">
            </div>

            <!-- Estilos globales -->
            <div style="border:1px solid rgba(212,160,23,0.15);border-radius:8px;padding:16px;margin-bottom:20px">
              <strong style="color:rgba(255,255,255,0.7);font-size:13px;display:block;margin-bottom:12px">Estilo global de títulos de tarjeta</strong>
              <div class="flex gap-12" style="flex-wrap:wrap;align-items:center">
                <div class="form-group" style="margin-bottom:0;min-width:130px">
                  <label>Fuente</label>
                  <select [(ngModel)]="config()!.details.titleStyle.fontFamily">
                    <option value="sans">Sans (Lato)</option>
                    <option value="serif">Serif (Playfair)</option>
                    <option value="script">Script (Great Vibes)</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom:0;min-width:90px">
                  <label>Tamaño (px)</label>
                  <input type="number" [(ngModel)]="config()!.details.titleStyle.fontSize" min="12" max="36" step="1">
                </div>
                <div class="form-group" style="margin-bottom:0;min-width:90px">
                  <label>Color</label>
                  <div class="flex gap-8">
                    <input type="color" [(ngModel)]="config()!.details.titleStyle.color">
                    <input type="text" [(ngModel)]="config()!.details.titleStyle.color" style="max-width:90px;font-size:12px">
                  </div>
                </div>
              </div>
            </div>

            <div style="border:1px solid rgba(212,160,23,0.15);border-radius:8px;padding:16px;margin-bottom:20px">
              <strong style="color:rgba(255,255,255,0.7);font-size:13px;display:block;margin-bottom:12px">Estilo global de contenido de tarjeta</strong>
              <div class="flex gap-12" style="flex-wrap:wrap;align-items:center">
                <div class="form-group" style="margin-bottom:0;min-width:130px">
                  <label>Fuente</label>
                  <select [(ngModel)]="config()!.details.contentStyle.fontFamily">
                    <option value="sans">Sans (Lato)</option>
                    <option value="serif">Serif (Playfair)</option>
                    <option value="script">Script (Great Vibes)</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom:0;min-width:90px">
                  <label>Tamaño (px)</label>
                  <input type="number" [(ngModel)]="config()!.details.contentStyle.fontSize" min="10" max="28" step="1">
                </div>
                <div class="form-group" style="margin-bottom:0;min-width:90px">
                  <label>Color</label>
                  <div class="flex gap-8">
                    <input type="color" [(ngModel)]="config()!.details.contentStyle.color">
                    <input type="text" [(ngModel)]="config()!.details.contentStyle.color" style="max-width:90px;font-size:12px">
                  </div>
                </div>
              </div>
            </div>

            @for (card of config()!.details.cards; track card.id; let i = $index) {
              <div style="border:1px solid rgba(212,160,23,0.2);border-radius:8px;padding:16px;margin-bottom:16px">
                <div class="flex-between mb-12">
                  <div class="flex gap-8" style="align-items:center">
                    @if (card.iconUrl) {
                      <img [src]="card.iconUrl" style="width:32px;height:32px;border-radius:50%;object-fit:cover">
                    }
                    <strong style="color:var(--gold)">{{ card.title || 'Tarjeta ' + (i+1) }}</strong>
                  </div>
                  <button class="btn btn-danger btn-sm btn-icon" (click)="removeDetailCard(i)" title="Eliminar">
                    <span class="material-icons" style="font-size:16px">delete</span>
                  </button>
                </div>
                <div class="form-group">
                  <label>Icono/Imagen de tarjeta (opcional)</label>
                  <div class="flex gap-8">
                    <input type="text" [(ngModel)]="card.iconUrl" placeholder="URL imagen o subir">
                    <label class="btn btn-secondary btn-sm" style="cursor:pointer;white-space:nowrap">
                      <span class="material-icons">upload</span> Subir
                      <input type="file" accept="image/*" (change)="uploadDetailIcon($event, card)" style="display:none">
                    </label>
                  </div>
                  <small class="text-muted">Si no se configura, no se mostrará icono</small>
                </div>
                <div class="form-group">
                  <label>Título de tarjeta</label>
                  <input type="text" [(ngModel)]="card.title" placeholder="Padres, Padrinos, etc.">
                </div>
                <div class="form-group">
                  <label>Contenido</label>
                  <textarea [(ngModel)]="card.content" rows="4" placeholder="Escribe nombres o texto...
Usa saltos de línea para separar"></textarea>
                </div>
                <div class="flex gap-12" style="align-items:center;flex-wrap:wrap">
                  <div class="form-group" style="margin-bottom:0;min-width:140px">
                    <label>Alineación</label>
                    <select [(ngModel)]="card.textAlign">
                      <option value="left">Izquierda</option>
                      <option value="center">Centro</option>
                      <option value="right">Derecha</option>
                    </select>
                  </div>
                  <div style="flex:1;min-width:200px;padding:12px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid rgba(255,255,255,0.1)">
                    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">Vista previa:</p>
                    <p [style.text-align]="card.textAlign" [style.font-size.px]="config()!.details.contentStyle.fontSize" [style.color]="config()!.details.contentStyle.color" style="line-height:1.6;white-space:pre-line">{{ card.content || 'Texto de ejemplo' }}</p>
                  </div>
                </div>
              </div>
            }

            @if (config()!.details.cards.length === 0) {
              <div class="text-center text-muted" style="padding:40px">
                <span class="material-icons" style="font-size:48px;opacity:0.3">article</span>
                <p style="margin-top:8px">No hay tarjetas. Agrega la primera.</p>
              </div>
            }
          </div>
        }

        <!-- VENUES -->
        @if (activeTab === 'venues') {
          <div class="card">
            <div class="flex-between mb-16">
              <div>
                <h3 class="text-gold">Lugares del Evento</h3>
                <p class="text-muted" style="font-size:13px;margin-top:4px">Configura los lugares donde se realizará el evento</p>
              </div>
              <div class="flex gap-8">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="config()!.venues.enabled"><span class="toggle"></span><span>Sección visible</span>
                </label>
                <button class="btn btn-primary btn-sm" (click)="addVenue()">
                  <span class="material-icons">add</span> Agregar Lugar
                </button>
              </div>
            </div>

            @for (venue of config()!.venues.items; track venue.id; let i = $index) {
              <div class="venue-card">
                <div class="venue-header">
                  <div class="flex gap-12" style="align-items:center">
                    <div class="venue-icon-preview">
                      @if (venue.icon) {
                        <img [src]="venue.icon" style="width:100%;height:100%;object-fit:cover;border-radius:8px">
                      } @else {
                        <span class="material-icons" style="color:var(--gold);font-size:24px">place</span>
                      }
                    </div>
                    <strong style="color:var(--gold)">{{ venue.title || 'Lugar ' + (i+1) }}</strong>
                  </div>
                  <button class="btn btn-danger btn-sm btn-icon" (click)="removeVenue(i)" title="Eliminar">
                    <span class="material-icons" style="font-size:16px">delete</span>
                  </button>
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label>Título del evento</label>
                    <input type="text" [(ngModel)]="venue.title" placeholder="Ceremonia, Recepción, Cena...">
                  </div>
                  <div class="form-group">
                    <label>Nombre del lugar</label>
                    <input type="text" [(ngModel)]="venue.name" placeholder="Salón Versalles">
                  </div>
                </div>

                <div class="form-group">
                  <label>Icono del lugar (imagen 60x60)</label>
                  <div class="flex gap-8">
                    <input type="text" [(ngModel)]="venue.icon" placeholder="URL imagen/icono">
                    <label class="btn btn-secondary btn-sm" style="cursor:pointer;white-space:nowrap">
                      <span class="material-icons">upload</span> Subir
                      <input type="file" accept="image/*" (change)="uploadVenueIcon($event, venue)" style="display:none">
                    </label>
                  </div>
                  <small class="text-muted">Imagen cuadrada ~60x60px (icono representativo del lugar)</small>
                </div>

                <div class="form-group">
                  <label>Dirección</label>
                  <input type="text" [(ngModel)]="venue.address" placeholder="Av. Principal 123, Ciudad">
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label>URL Google Maps</label>
                    <input type="text" [(ngModel)]="venue.mapsUrl" placeholder="https://maps.google.com/...">
                  </div>
                  <div class="form-group">
                    <label>Horario</label>
                    <div class="time-inputs">
                      <div class="time-field">
                        <button (click)="adjustVenueTime(venue,'h',1)"><span class="material-icons">expand_less</span></button>
                        <span class="time-val">{{ venueHour(venue) | number:'2.0-0' }}</span>
                        <button (click)="adjustVenueTime(venue,'h',-1)"><span class="material-icons">expand_more</span></button>
                        <small>HH</small>
                      </div>
                      <span class="time-sep">:</span>
                      <div class="time-field">
                        <button (click)="adjustVenueTime(venue,'m',1)"><span class="material-icons">expand_less</span></button>
                        <span class="time-val">{{ venueMin(venue) | number:'2.0-0' }}</span>
                        <button (click)="adjustVenueTime(venue,'m',-1)"><span class="material-icons">expand_more</span></button>
                        <small>MM</small>
                      </div>
                      <div class="time-ampm">
                        <button [class.active]="venueAmPm(venue)==='AM'" (click)="setAmPm(venue,'AM')">AM</button>
                        <button [class.active]="venueAmPm(venue)==='PM'" (click)="setAmPm(venue,'PM')">PM</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (config()!.venues.items.length === 0) {
              <div class="text-center text-muted" style="padding:40px">
                <span class="material-icons" style="font-size:48px;opacity:0.3">place</span>
                <p style="margin-top:8px">No hay lugares configurados. Agrega el primero.</p>
              </div>
            }
          </div>
        }

        <!-- ITINERARY -->
        @if (activeTab === 'itinerary') {
          <div class="card">
            <div class="flex-between mb-16">
              <h3 class="text-gold">Itinerario</h3>
              <div class="flex gap-8">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="config()!.itinerary.enabled"><span class="toggle"></span><span>Visible</span>
                </label>
                <button class="btn btn-primary btn-sm" (click)="addItinerary()"><span class="material-icons">add</span> Agregar</button>
              </div>
            </div>
            <div class="form-group">
              <label>Título de la sección</label>
              <input type="text" [(ngModel)]="config()!.itinerary.title">
            </div>
            @for (item of itinerary(); track item.id; let i = $index) {
              <div style="border:1px solid rgba(212,160,23,0.15);border-radius:8px;padding:16px;margin-bottom:12px">
                <div class="flex-between mb-12">
                  <strong style="color:var(--gold)">Actividad {{ i + 1 }}</strong>
                  <button class="btn btn-danger btn-sm btn-icon" (click)="removeItinerary(item)"><span class="material-icons" style="font-size:16px">delete</span></button>
                </div>
                <div class="grid-2">
                  <div class="form-group">
                    <label>Icono (Material Icon)</label>
                    <input type="text" [(ngModel)]="item.icon" placeholder="restaurant, music_note, cake...">
                  </div>
                  <div class="form-group">
                    <label>Horario</label>
                    <input type="text" [(ngModel)]="item.time" placeholder="7:00 PM">
                  </div>
                </div>
                <div class="form-group"><label>Título</label><input type="text" [(ngModel)]="item.title" placeholder="Cena de gala"></div>
                <div class="form-group"><label>Descripción</label><input type="text" [(ngModel)]="item.description"></div>
                <button class="btn btn-secondary btn-sm" (click)="saveItineraryItem(item)"><span class="material-icons">save</span> Guardar actividad</button>
              </div>
            }
          </div>
        }

        <!-- GALLERY -->
        @if (activeTab === 'gallery') {
          <div class="card">
            <div class="flex-between mb-16">
              <h3 class="text-gold">Galería de Fotos</h3>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="config()!.gallery.enabled"><span class="toggle"></span><span>Visible</span>
              </label>
            </div>
            <div class="form-group"><label>Título</label><input type="text" [(ngModel)]="config()!.gallery.title"></div>
            <div class="form-group"><label>Descripción</label><textarea [(ngModel)]="config()!.gallery.description"></textarea></div>
            <div class="form-group">
              <label>Subir fotos</label>
              <label class="file-drop-zone" style="cursor:pointer">
                <span class="material-icons">add_photo_alternate</span>
                <p>Haz clic para seleccionar fotos (máx 20)</p>
                <input type="file" accept="image/*" multiple (change)="uploadPhotos($event)" style="display:none">
              </label>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-top:16px">
              @for (photo of photos(); track photo.id) {
                <div style="position:relative">
                  <img [src]="photo.url" style="width:100%;height:100px;object-fit:cover;border-radius:8px">
                  <button class="btn btn-danger btn-sm btn-icon" style="position:absolute;top:4px;right:4px;padding:4px" (click)="deletePhoto(photo)">
                    <span class="material-icons" style="font-size:14px">close</span>
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- DRESSCODE -->
        @if (activeTab === 'dresscode') {
          <div class="card">
            <div class="flex-between mb-16">
              <h3 class="text-gold">Código de Vestimenta</h3>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="config()!.dresscode.enabled"><span class="toggle"></span><span>Visible</span>
              </label>
            </div>
            <div class="form-group"><label>Título</label><input type="text" [(ngModel)]="config()!.dresscode.title"></div>
            <div class="form-group"><label>Descripción</label><textarea [(ngModel)]="config()!.dresscode.description" placeholder="Formal, Semiformal, Colores permitidos..."></textarea></div>
          </div>
        }

        <!-- GIFTS -->
        @if (activeTab === 'gifts') {
          <div class="card">
            <div class="flex-between mb-16">
              <h3 class="text-gold">Mesa de Regalos</h3>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="config()!.gifts.enabled"><span class="toggle"></span><span>Visible</span>
              </label>
            </div>
            <div class="form-group"><label>Título</label><input type="text" [(ngModel)]="config()!.gifts.title"></div>
            <div class="form-group"><label>Descripción</label><textarea [(ngModel)]="config()!.gifts.description"></textarea></div>
            <div class="form-group"><label>Link (Liverpool, Amazon, Mercado Libre, etc.)</label><input type="url" [(ngModel)]="config()!.gifts.link" placeholder="https://..."></div>
            <div class="form-group"><label>Texto del botón</label><input type="text" [(ngModel)]="config()!.gifts.buttonText" placeholder="Ver Lista de Regalos"></div>
          </div>
        }

        <!-- RSVP -->
        @if (activeTab === 'rsvp') {
          <div class="card">
            <div class="flex-between mb-16">
              <h3 class="text-gold">RSVP - Confirmación</h3>
              <label class="toggle-switch">
                <input type="checkbox" [(ngModel)]="config()!.rsvp.enabled"><span class="toggle"></span><span>Visible</span>
              </label>
            </div>
            <div class="form-group"><label>Título</label><input type="text" [(ngModel)]="config()!.rsvp.title"></div>
          </div>
        }

        <div class="mt-24">
          <button class="btn btn-primary" (click)="save()" [disabled]="saving()">
            <span class="material-icons">save</span> {{ saving() ? 'Guardando...' : 'Guardar Todos los Cambios' }}
          </button>
        </div>
      }
    </div>
  `
})
export class ConfigComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  eventId = 0;
  config = signal<EventConfig | null>(null);
  itinerary = signal<ItineraryItem[]>([]);
  photos = signal<any[]>([]);
  saving = signal(false);
  activeTab = 'intro';
  @ViewChild('tabsEl') tabsEl!: ElementRef<HTMLElement>;

  scrollTabs(delta: number) {
    this.tabsEl.nativeElement.scrollBy({ left: delta, behavior: 'smooth' });
  }

  // Countdown picker
  countdownDate = '';
  countdownHour = 20;
  countdownMin = 0;

  get countdownPreview() {
    if (!this.countdownDate) return 'Sin fecha';
    const h = String(this.countdownHour).padStart(2, '0');
    const m = String(this.countdownMin).padStart(2, '0');
    return `${this.countdownDate} ${h}:${m}`;
  }

  adjustTime(unit: 'h' | 'm', delta: number) {
    if (unit === 'h') {
      this.countdownHour = (this.countdownHour + delta + 24) % 24;
    } else {
      this.countdownMin = (this.countdownMin + delta + 60) % 60;
    }
    this.updateCountdown();
  }

  updateCountdown() {
    if (!this.countdownDate) return;
    const h = String(this.countdownHour).padStart(2, '0');
    const m = String(this.countdownMin).padStart(2, '0');
    this.config()!.hero.countdownDate = `${this.countdownDate}T${h}:${m}:00`;
  }

  tabs = [
    { key: 'intro', label: 'Intro' },
    { key: 'hero', label: 'Carátula' },
    { key: 'invitation', label: 'Invitación' },
    { key: 'details', label: 'Detalles' },
    { key: 'venues', label: 'Eventos' },
    { key: 'itinerary', label: 'Itinerario' },
    { key: 'gallery', label: 'Galería' },
    { key: 'dresscode', label: 'Vestimenta' },
    { key: 'gifts', label: 'Regalos' },
    { key: 'rsvp', label: 'RSVP' }
  ];

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getConfig(this.eventId).subscribe(c => {
      const cfg = this.ensureDefaults(c.config_json);
      this.config.set(cfg);
      const dt = cfg.hero?.countdownDate;
      if (dt) {
        const d = new Date(dt);
        this.countdownDate = d.toISOString().slice(0, 10);
        this.countdownHour = d.getHours();
        this.countdownMin = d.getMinutes();
      }
    });
    this.api.getItinerary(this.eventId).subscribe(i => this.itinerary.set(i));
    this.api.getPhotos(this.eventId).subscribe(p => this.photos.set(p));
  }

  save() {
    if (!this.config()) return;
    this.saving.set(true);
    this.api.saveConfig(this.eventId, this.config()!).subscribe({
      next: () => { this.saving.set(false); },
      error: () => this.saving.set(false)
    });
  }

  uploadFile(event: any, type: 'images' | 'audio' | 'gifs', path: string) {
    const file = event.target.files[0]; if (!file) return;
    this.api.uploadFile(type, file).subscribe(r => {
      const keys = path.split('.');
      let obj: any = this.config();
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = r.url;
    });
  }

  addVenue() {
    const id = Date.now().toString();
    this.config()!.venues.items.push({ id, title: '', icon: '', name: '', address: '', time: '20:00', mapsUrl: '' });
  }

  removeVenue(i: number) {
    this.config()!.venues.items.splice(i, 1);
  }

  addDetailCard() {
    this.config()!.details.cards.push({ id: Date.now().toString(), iconUrl: '', title: '', content: '', textAlign: 'center' });
  }

  removeDetailCard(i: number) {
    this.config()!.details.cards.splice(i, 1);
  }

  uploadDetailIcon(event: any, card: any) {
    const file = event.target.files[0]; if (!file) return;
    this.api.uploadFile('images', file).subscribe(r => card.iconUrl = r.url);
  }

  uploadVenueIcon(event: any, venue: any) {
    const file = event.target.files[0]; if (!file) return;
    this.api.uploadFile('images', file).subscribe(r => venue.icon = r.url);
  }

  venueHour(venue: any): number {
    const t = venue.time || '20:00';
    const h = parseInt(t.split(':')[0]) % 12 || 12;
    return h;
  }

  venueMin(venue: any): number {
    const t = venue.time || '20:00';
    return parseInt(t.split(':')[1]) || 0;
  }

  venueAmPm(venue: any): string {
    const t = venue.time || '20:00';
    return parseInt(t.split(':')[0]) >= 12 ? 'PM' : 'AM';
  }

  adjustVenueTime(venue: any, unit: 'h' | 'm', delta: number) {
    let h = parseInt(venue.time?.split(':')[0] || '20');
    let m = parseInt(venue.time?.split(':')[1] || '0');
    if (unit === 'h') h = (h + delta + 24) % 24;
    else m = (m + delta + 60) % 60;
    venue.time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  setAmPm(venue: any, ampm: string) {
    let h = parseInt(venue.time?.split(':')[0] || '20');
    const m = parseInt(venue.time?.split(':')[1] || '0');
    if (ampm === 'AM' && h >= 12) h -= 12;
    if (ampm === 'PM' && h < 12) h += 12;
    venue.time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  addItinerary() {
    const item: ItineraryItem = { icon: 'event', time: '', title: '', description: '', sort_order: this.itinerary().length };
    this.api.addItineraryItem(this.eventId, item).subscribe(r => {
      this.itinerary.update(list => [...list, { ...item, id: r.id }]);
    });
  }

  saveItineraryItem(item: ItineraryItem) {
    if (item.id) this.api.updateItineraryItem(this.eventId, item.id, item).subscribe();
  }

  removeItinerary(item: ItineraryItem) {
    if (!item.id) return;
    this.api.deleteItineraryItem(this.eventId, item.id).subscribe(() => {
      this.itinerary.update(list => list.filter(i => i.id !== item.id));
    });
  }

  uploadPhotos(event: any) {
    const files = event.target.files; if (!files?.length) return;
    this.api.uploadPhotos(this.eventId, files).subscribe(r => {
      this.photos.update(p => [...p, ...r.photos]);
    });
  }

  deletePhoto(photo: any) {
    this.api.deletePhoto(this.eventId, photo.id).subscribe(() => {
      this.photos.update(p => p.filter(x => x.id !== photo.id));
    });
  }

  private ensureDefaults(cfg: any): EventConfig {
    return {
      intro: cfg?.intro || { enabled: true, background: '', phrase: '', duration: 4 },
      hero: {
        backgroundGif: cfg?.hero?.backgroundGif || '',
        audioUrl: cfg?.hero?.audioUrl || '',
        eventDescription: cfg?.hero?.eventDescription || '',
        celebrantNames: cfg?.hero?.celebrantNames || '',
        heroPhrase: cfg?.hero?.heroPhrase || '',
        countdownDate: cfg?.hero?.countdownDate || '',
        eventDescriptionStyle: { fontFamily: 'sans', fontSize: 22, color: '#ffffff', ...(cfg?.hero?.eventDescriptionStyle || {}) },
        celebrantNamesStyle: { fontFamily: 'script', fontSize: 80, color1: '#d4a017', color2: '#b8860b', gradientAngle: 135, ...(cfg?.hero?.celebrantNamesStyle || {}) },
        heroPhraseStyle: { fontFamily: 'serif', fontSize: 16, color: '#ffffff', ...(cfg?.hero?.heroPhraseStyle || {}) }
      },
      invitation: cfg?.invitation || { title: 'Están cordialmente invitados', subtitle: '' },
      details: cfg?.details?.cards
        ? {
            enabled: cfg.details.enabled ?? true,
            title: cfg.details.title || 'Detalles del Evento',
            titleStyle: { fontFamily: 'serif', fontSize: 18, color: '#d4a017', ...(cfg.details.titleStyle || {}) },
            contentStyle: { fontFamily: 'sans', fontSize: 14, color: '#ffffffb3', ...(cfg.details.contentStyle || {}) },
            cards: cfg.details.cards
          }
        : {
            enabled: true,
            title: 'Detalles del Evento',
            titleStyle: { fontFamily: 'serif', fontSize: 18, color: '#d4a017' },
            contentStyle: { fontFamily: 'sans', fontSize: 14, color: '#ffffffb3' },
            cards: this.migrateDetails(cfg?.details)
          },
      venues: cfg?.venues || { enabled: true, items: [] },
      itinerary: cfg?.itinerary || { enabled: true, title: 'Itinerario', items: [] },
      gallery: cfg?.gallery || { enabled: true, title: 'Galería', description: '' },
      dresscode: cfg?.dresscode || { enabled: true, title: 'Código de Vestimenta', description: '' },
      gifts: cfg?.gifts || { enabled: true, title: 'Mesa de Regalos', description: '', link: '', buttonText: 'Ver Lista' },
      rsvp: cfg?.rsvp || { enabled: true, title: 'Confirmar Asistencia' }
    };
  }

  private migrateDetails(old: any): DetailCard[] {
    if (!old) return [];
    const cards: DetailCard[] = [];
    if (old.parents?.enabled && old.parents.content) {
      cards.push({ id: '1', iconUrl: '', title: old.parents.title || 'Padres', content: old.parents.content, textAlign: 'center' });
    }
    if (old.godparents?.enabled && old.godparents.content) {
      cards.push({ id: '2', iconUrl: '', title: old.godparents.title || 'Padrinos', content: old.godparents.content, textAlign: 'center' });
    }
    return cards;
  }
}
