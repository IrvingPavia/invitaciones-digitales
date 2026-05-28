import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ColorPickerComponent } from '../../../core/components/color-picker.component';
import { Guest } from '../../../core/models/models';

interface CardElement {
  id: string;
  type: 'text' | 'image' | 'qr' | 'separator';
  x: number; y: number; width: number; height?: number;
  content?: string; fontFamily?: string; fontSize?: number;
  fontWeight?: number; color?: string; textAlign?: string;
  imageUrl?: string; objectFit?: string;
  qrSize?: number; qrColor?: string; qrBgColor?: string;
  labelColor?: string; showLabel?: boolean;
  shapeColor?: string; lineStyle?: string; lineWidth?: number;
}

interface CardSide {
  bgColor: string; bgColor2?: string; bgGradientAngle?: number; bgGradientIntensity?: number;
  bgImage?: string; bgImageOpacity?: number;
  borderColor: string; borderWidth: number; borderRadius: number;
  elements: CardElement[];
  // Legacy fields
  textColor?: string; footerText?: string; topText?: string;
  qrColor?: string; qrSize?: number;
}

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ColorPickerComponent],
  styles: [`
    .editor-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
    @media (max-width: 900px) { .editor-layout { grid-template-columns: 1fr; } }
    .card-preview-area {
      background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .card-canvas {
      position: relative; border-radius: 4px; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      width: 100%; max-width: 400px;
    }
    .card-canvas-bg { position: absolute; inset: 0; }
    .card-canvas-overlay { position: absolute; inset: 0; }
    .card-el {
      position: absolute; cursor: move; transition: outline 0.2s;
      outline: 1px solid transparent; padding: 2px;
      user-select: none; -webkit-user-select: none;
    }
    .card-el:hover { outline: 1px dashed rgba(124,92,191,0.5); }
    .card-el.selected { outline: 2px solid var(--gold); }
    .card-el.selected .resize-handle { display: block; }
    .resize-handle {
      display: none; position: absolute; bottom: -4px; right: -4px;
      width: 10px; height: 10px; background: var(--gold);
      border: 1px solid white; border-radius: 2px; cursor: nwse-resize;
    }
    .snap-guide-v, .snap-guide-h {
      position: absolute; z-index: 100; pointer-events: none;
    }
    .snap-guide-v {
      width: 1px; top: 0; bottom: 0;
      border-left: 1px dashed rgba(124,92,191,0.8);
    }
    .snap-guide-h {
      height: 1px; left: 0; right: 0;
      border-top: 1px dashed rgba(124,92,191,0.8);
    }
    .panel { max-height: 70vh; overflow-y: auto; overflow-x: hidden; }
    .panel-section {
      border: 1px solid rgba(124,92,191,0.15); border-radius: 10px;
      margin-bottom: 12px; background: rgba(255,255,255,0.02);
    }
    .panel-header {
      padding: 10px 14px; font-size: 13px; font-weight: 600;
      color: rgba(255,255,255,0.8); cursor: pointer;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(124,92,191,0.1);
    }
    .panel-body { padding: 12px 14px; }
    .add-element-bar {
      display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;
    }
    .add-el-btn {
      display: flex; align-items: center; gap: 4px;
      background: rgba(124,92,191,0.1); border: 1px solid rgba(124,92,191,0.3);
      border-radius: 6px; padding: 6px 10px; font-size: 11px;
      color: var(--gold-light); cursor: pointer; transition: all 0.2s;
    }
    .add-el-btn:hover { background: rgba(124,92,191,0.2); border-color: var(--gold); }
    .add-el-btn .material-icons { font-size: 14px; }
    .el-list-item {
      display: flex; align-items: center; gap: 8px; padding: 6px 8px;
      border-radius: 6px; font-size: 12px; color: rgba(255,255,255,0.7);
      cursor: pointer; transition: background 0.2s;
    }
    .el-list-item:hover { background: rgba(124,92,191,0.1); }
    .el-list-item.active { background: rgba(124,92,191,0.15); color: var(--gold-light); }
    .el-list-item .material-icons { font-size: 16px; opacity: 0.6; }
    .el-delete {
      margin-left: auto; background: none; border: none; cursor: pointer;
      color: rgba(255,255,255,0.3); padding: 2px;
      .material-icons { font-size: 14px; }
      &:hover { color: #ff6b7a; }
    }
    .prop-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-end; }
    .prop-field { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
    .prop-field label { font-size: 11px; color: rgba(255,255,255,0.5); }
    .prop-field input, .prop-field select {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px; padding: 6px 8px; color: white; font-size: 12px;
    }
    .prop-field-sm { max-width: 70px; flex: 0 0 70px; }
    .layout-preview-container { display: flex; justify-content: center; }
    .layout-preview {
      width: 100%; max-width: 240px; background: white; border-radius: 4px;
      padding: 4%; display: flex; flex-wrap: wrap; gap: 2%; align-content: flex-start;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    }
    .layout-slot {
      display: flex; gap: 1%; margin-bottom: 2%;
    }
    .layout-slot-front, .layout-slot-back {
      flex: 1; border-radius: 2px; display: flex; align-items: center; justify-content: center;
      font-size: 8px; font-weight: 600;
    }
    .layout-slot-front { background: rgba(124,92,191,0.2); border: 1px dashed rgba(124,92,191,0.5); color: #7c5cbf; }
    .layout-slot-back { background: rgba(40,167,69,0.15); border: 1px dashed rgba(40,167,69,0.4); color: #28a745; }
  `],
    template: `
    <div>
      <div class="flex-between mb-24">
        <div>
          <a routerLink="/dashboard/events" class="back-link"><span class="material-icons">arrow_back</span> Volver</a>
          <h2 class="section-title">Diseño de Tarjetas</h2>
          <p class="section-subtitle">Editor visual para invitaciones físicas</p>
        </div>
        <div class="flex gap-8">
          <button class="btn" [class.btn-secondary]="saveStatus() === 'idle'" [class.btn-success]="saveStatus() === 'saved'" [class.btn-danger]="saveStatus() === 'error'" [class.btn-primary]="saveStatus() === 'saving'" (click)="save()" [disabled]="saving()">
            <span class="material-icons">{{ saveStatus() === 'saved' ? 'check_circle' : saveStatus() === 'error' ? 'error' : 'save' }}</span>
            {{ saveStatus() === 'saving' ? 'Guardando...' : saveStatus() === 'saved' ? 'Guardado ✓' : saveStatus() === 'error' ? 'Error' : 'Guardar' }}
          </button>
          <button class="btn btn-primary" (click)="downloadPDF()" [disabled]="downloading()"><span class="material-icons">picture_as_pdf</span> {{ downloading() ? 'Generando...' : 'PDF' }}</button>
        </div>
      </div>

      <!-- Side tabs -->
      <div class="tabs mb-16">
        <div class="tab" [class.active]="side === 'layout'" (click)="side = 'layout'; selectedEl = null">Tamaño / Layout</div>
        <div class="tab" [class.active]="side === 'front'" (click)="side = 'front'; selectedEl = null">Frente</div>
        <div class="tab" [class.active]="side === 'back'" (click)="side = 'back'; selectedEl = null">Reverso</div>
      </div>

      @if (side === 'layout') {
        <div class="card">
          <h4 style="color:var(--gold-light);margin-bottom:16px;">Configuración del PDF</h4>
          <div class="prop-row">
            <div class="prop-field"><label>Tamaño de página</label>
              <select [(ngModel)]="pdfLayout.pageSize">
                <option value="letter">Carta (216×279mm)</option>
                <option value="a4">A4 (210×297mm)</option>
                <option value="legal">Oficio (216×356mm)</option>
              </select>
            </div>
            <div class="prop-field"><label>Orientación</label>
              <select [(ngModel)]="pdfLayout.orientation"><option value="portrait">Vertical</option><option value="landscape">Horizontal</option></select>
            </div>
          </div>
          <div class="prop-row">
            <div class="prop-field prop-field-sm"><label>Ancho tarjeta (mm)</label><input type="number" [(ngModel)]="cardWidth" min="50" max="150"></div>
            <div class="prop-field prop-field-sm"><label>Alto tarjeta (mm)</label><input type="number" [(ngModel)]="cardHeight" min="30" max="100"></div>
            <div class="prop-field prop-field-sm"><label>Margen: {{ pdfLayout.margin }}mm</label><input type="range" [(ngModel)]="pdfLayout.margin" min="5" max="25"></div>
          </div>
          <div class="prop-row">
            <div class="prop-field">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:8px;" (click)="pdfLayout.showCutMarks = !pdfLayout.showCutMarks">
                <input type="checkbox" [checked]="pdfLayout.showCutMarks"> Marcas de corte
              </label>
            </div>
          </div>
          <p class="text-muted" style="font-size:12px;margin-top:12px;">Total invitados: {{ guests().length }} → {{ getPageCount() }} páginas</p>
        </div>

        <!-- Layout preview -->
        <div class="card" style="margin-top:16px;">
          <h4 style="color:var(--gold-light);margin-bottom:12px;">Vista previa de página</h4>
          <div class="layout-preview-container">
            <div class="layout-preview" [style.aspect-ratio]="getPageAspect()" [style.padding.%]="getMarginPercent()">>
              @for (i of getLayoutSlots(); track i) {
                <div class="layout-slot" [style.width.%]="getSlotWidth()" [style.height.%]="getSlotHeight()">
                  <div class="layout-slot-front">F</div>
                  <div class="layout-slot-back">R</div>
                </div>
              }
            </div>
          </div>
          <p class="text-muted" style="font-size:11px;margin-top:8px;text-align:center;">{{ getCardsPerPage() }} pares (frente+reverso) por página</p>
        </div>
      }

      @if (side !== 'layout') {
        <div class="editor-layout">
          <!-- Preview area -->
          <div class="card-preview-area">
            <p style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;">{{ side === 'front' ? 'Frente' : 'Reverso' }}</p>
            <div class="card-canvas" #cardCanvas [style.border-radius.px]="currentSide().borderRadius || 4" [style.aspect-ratio]="cardWidth + '/' + cardHeight">>
              <!-- Background -->
              <div class="card-canvas-bg" [style.background]="getCanvasBg()" [style.border]="currentSide().borderWidth + 'px solid ' + currentSide().borderColor" [style.border-radius.px]="currentSide().borderRadius || 4"></div>
              @if (currentSide().bgImage && currentSide().bgImageOpacity) {
                <div class="card-canvas-overlay" [style.background]="'rgba(0,0,0,' + (1 - (currentSide().bgImageOpacity || 1)) + ')'"></div>
              }
              <!-- Elements -->
              @for (el of currentSide().elements; track el.id) {
                <div class="card-el" [class.selected]="selectedEl?.id === el.id"
                     (mousedown)="onElMouseDown($event, el)" (touchstart)="onElTouchStart($event, el)"
                     [style.left.%]="el.x" [style.top.%]="el.y" [style.width.%]="el.width" [style.height.%]="el.height || null">
                  @if (el.type === 'text') {
                    <div [style.font-family]="getFontFamily(el.fontFamily)" [style.font-size.px]="el.fontSize || 14"
                         [style.font-weight]="el.fontWeight || 400" [style.color]="el.color || '#333'"
                         [style.text-align]="el.textAlign || 'center'">{{ replaceVarsPreview(el.content) }}</div>
                  }
                  @if (el.type === 'image' && el.imageUrl) {
                    <img [src]="el.imageUrl" style="width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;">
                  }
                  @if (el.type === 'qr') {
                    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;pointer-events:none;">
                      <span class="material-icons" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:40px;" [style.color]="el.qrColor || '#000'" [style.background]="el.qrBgColor === 'transparent' ? 'none' : (el.qrBgColor || 'none')" [style.border-radius.px]="3">qr_code_2</span>
                      @if (el.showLabel !== false) {
                        <span [style.color]="el.labelColor || '#999'" style="font-size:8px;margin-top:2px;">{{ previewGuest()?.unique_code || 'ABC123' }}</span>
                      }
                    </div>
                  }
                  @if (el.type === 'separator') {
                    <div [style]="getSeparatorStyle(el)" style="width:100%;pointer-events:none;"></div>
                  }
                  <div class="resize-handle" (mousedown)="onResizeMouseDown($event, el)" (touchstart)="onResizeTouchStart($event, el)"></div>
                </div>
              }
              <!-- Snap guides -->
              @if (snapGuides.v !== null) { <div class="snap-guide-v" [style.left.%]="snapGuides.v"></div> }
              @if (snapGuides.h !== null) { <div class="snap-guide-h" [style.top.%]="snapGuides.h"></div> }
            </div>
            <!-- Guest selector -->
            @if (guests().length) {
              <select (change)="selectPreview($event)" style="font-size:12px;max-width:200px;">
                @for (g of guests(); track g.id) { <option [value]="g.id">{{ g.family_name || g.guest_names }}</option> }
              </select>
            }
          </div>

          <!-- Properties panel -->
          <div class="panel">
            <!-- Add elements -->
            <div class="add-element-bar">
              <button class="add-el-btn" (click)="addElement('text')"><span class="material-icons">text_fields</span> Texto</button>
              <button class="add-el-btn" (click)="addElement('image')"><span class="material-icons">image</span> Imagen</button>
              @if (side === 'back') { <button class="add-el-btn" (click)="addElement('qr')"><span class="material-icons">qr_code</span> QR</button> }
              <button class="add-el-btn" (click)="addElement('separator')"><span class="material-icons">horizontal_rule</span> Línea</button>
            </div>

            <!-- Background config -->
            <div class="panel-section">
              <div class="panel-header"><span>Fondo</span></div>
              <div class="panel-body">
                <div class="prop-row">
                  <div class="prop-field"><label>Color 1</label><app-color-picker [value]="currentSide().bgColor" (valueChange)="currentSide().bgColor = $event"></app-color-picker></div>
                  <div class="prop-field"><label>Color 2</label><app-color-picker [value]="currentSide().bgColor2 || ''" (valueChange)="currentSide().bgColor2 = $event"></app-color-picker></div>
                </div>
                @if (currentSide().bgColor2) {
                  <div class="prop-row" style="margin-bottom:8px;">
                    <div class="prop-field"><label>Ángulo</label><input type="range" min="0" max="360" [(ngModel)]="currentSide().bgGradientAngle"></div>
                    <div class="prop-field prop-field-sm"><label>{{ currentSide().bgGradientAngle }}°</label><input type="number" min="0" max="360" [(ngModel)]="currentSide().bgGradientAngle"></div>
                  </div>
                  <div class="prop-row" style="margin-bottom:8px;">
                    <div class="prop-field"><label>Intensidad</label><input type="range" min="0" max="100" [(ngModel)]="currentSide().bgGradientIntensity"></div>
                    <div class="prop-field prop-field-sm"><label>{{ currentSide().bgGradientIntensity }}%</label><input type="number" min="0" max="100" [(ngModel)]="currentSide().bgGradientIntensity"></div>
                  </div>
                }
                <div class="prop-row">
                  <div class="prop-field"><label>Borde</label><app-color-picker [value]="currentSide().borderColor" (valueChange)="currentSide().borderColor = $event"></app-color-picker></div>
                  <div class="prop-field prop-field-sm"><label>Grosor</label><input type="number" [(ngModel)]="currentSide().borderWidth" min="0" max="5"></div>
                  <div class="prop-field prop-field-sm"><label>Radio</label><input type="number" [(ngModel)]="currentSide().borderRadius" min="0" max="20"></div>
                </div>
                <div class="prop-field" style="margin-top:8px;">
                  <label>Imagen de fondo</label>
                  <input type="file" accept="image/*" (change)="uploadBg($event)" style="font-size:11px;">
                  @if (currentSide().bgImage) {
                    <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                      <span style="font-size:11px;color:rgba(255,255,255,0.5);">Cargada ✔</span>
                      <button class="add-el-btn" style="font-size:10px;padding:3px 6px;" (click)="currentSide().bgImage = ''">✕</button>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Elements list -->
            <div class="panel-section">
              <div class="panel-header"><span>Elementos ({{ currentSide().elements.length }})</span></div>
              <div class="panel-body">
                @for (el of currentSide().elements; track el.id) {
                  <div class="el-list-item" [class.active]="selectedEl?.id === el.id" (click)="selectedEl = el">
                    <span class="material-icons">{{ getElIcon(el.type) }}</span>
                    <span>{{ getElLabel(el) }}</span>
                    <button class="el-delete" (click)="removeElement(el); $event.stopPropagation()"><span class="material-icons">close</span></button>
                  </div>
                }
                @if (!currentSide().elements.length) { <p class="text-muted" style="font-size:12px;">Sin elementos. Agrega uno arriba.</p> }
              </div>
            </div>

            <!-- Selected element properties -->
            @if (selectedEl) {
              <div class="panel-section">
                <div class="panel-header"><span>Propiedades</span></div>
                <div class="panel-body">
                  <div class="prop-row">
                    <div class="prop-field"><label>X: {{ round(selectedEl.x) }}%</label><input type="range" [(ngModel)]="selectedEl.x" min="0" max="95"></div>
                    <div class="prop-field"><label>Y: {{ round(selectedEl.y) }}%</label><input type="range" [(ngModel)]="selectedEl.y" min="0" max="95"></div>
                  </div>
                  <div class="prop-row">
                    <div class="prop-field"><label>Ancho: {{ round(selectedEl.width) }}%</label><input type="range" [(ngModel)]="selectedEl.width" min="5" max="100"></div>
                    <div class="prop-field"><label>Alto: {{ selectedEl.height ? round(selectedEl.height) + '%' : 'auto' }}</label><input type="range" [(ngModel)]="selectedEl.height" min="0" max="100"></div>
                  </div>
                  @if (selectedEl.type === 'text') {
                    <div class="prop-field" style="margin-bottom:8px;">
                      <label>Tipo de contenido</label>
                      <select (change)="applyTextPreset($event)">
                        <option value="">— Seleccionar variable —</option>
                        <option value="{nombre}">Nombre principal (invitado/familia)</option>
                        <option value="{invitados}">Lista de nombres</option>
                        <option value="{evento}">Nombre del evento</option>
                        <option value="{fecha}">Fecha del evento</option>
                        <option value="{tipo}">Tipo de evento</option>
                        <option value="{asistentes}">Número de asistentes</option>
                        <option value="{codigo}">Código único</option>
                        <option value="__custom__">✏️ Texto fijo (igual en todas)</option>
                      </select>
                    </div>
                    <div class="prop-field" style="margin-bottom:8px;"><label>Contenido</label><input type="text" [(ngModel)]="selectedEl.content"></div>
                    <div class="prop-row">
                      <div class="prop-field"><label>Fuente</label>
                        <select [(ngModel)]="selectedEl.fontFamily"><option value="sans">Lato</option><option value="serif">Playfair</option><option value="montserrat">Montserrat</option><option value="script">Great Vibes</option><option value="raleway">Raleway</option><option value="cinzel">Cinzel</option><option value="dancing">Dancing Script</option><option value="cormorant">Cormorant</option></select>
                      </div>
                      <div class="prop-field prop-field-sm"><label>Tamaño</label><input type="number" [(ngModel)]="selectedEl.fontSize" min="8" max="48"></div>
                    </div>
                    <div class="prop-row">
                      <div class="prop-field"><label>Color</label><app-color-picker [value]="selectedEl.color || '#333'" (valueChange)="selectedEl.color = $event"></app-color-picker></div>
                      <div class="prop-field"><label>Grosor: {{ selectedEl.fontWeight || 400 }}</label><input type="range" min="100" max="900" step="100" [(ngModel)]="selectedEl.fontWeight" style="width:100%;"></div>
                    </div>
                    <div class="prop-field"><label>Alineación</label>
                      <select [(ngModel)]="selectedEl.textAlign"><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option></select>
                    </div>
                  }
                  @if (selectedEl.type === 'image') {
                    <div class="prop-field"><label>Imagen</label><input type="file" accept="image/*" (change)="uploadElImage($event)" style="font-size:11px;"></div>
                  }
                  @if (selectedEl.type === 'qr') {
                    <div class="prop-field" style="margin-bottom:8px;"><label>Color QR</label><app-color-picker [value]="selectedEl.qrColor || '#000'" (valueChange)="selectedEl.qrColor = $event"></app-color-picker></div>
                    <div class="prop-field" style="margin-bottom:8px;">
                      <label>Fondo QR</label>
                      <app-color-picker [value]="selectedEl.qrBgColor || '#ffffff'" [showOpacity]="true" (valueChange)="selectedEl.qrBgColor = $event"></app-color-picker>
                    </div>
                    <div class="prop-field" style="margin-bottom:8px;"><label>Color código</label><app-color-picker [value]="selectedEl.labelColor || '#999'" (valueChange)="selectedEl.labelColor = $event"></app-color-picker></div>
                    <div class="prop-row">
                      <div class="prop-field">
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:11px;color:rgba(255,255,255,0.6);" (click)="selectedEl.showLabel = !selectedEl.showLabel">
                          <input type="checkbox" [checked]="selectedEl.showLabel !== false"> Mostrar código
                        </label>
                      </div>
                    </div>
                    <div class="prop-field" style="margin-top:8px;"><label>Tamaño: {{ round(selectedEl.width) }}%</label><input type="range" min="15" max="80" [ngModel]="selectedEl.width" (ngModelChange)="selectedEl.width = $event; selectedEl.height = $event * 1.2"></div>
                  }
                  @if (selectedEl.type === 'separator') {
                    <div class="prop-field" style="margin-bottom:8px;"><label>Color</label><app-color-picker [value]="selectedEl.shapeColor || '#d4a017'" (valueChange)="selectedEl.shapeColor = $event"></app-color-picker></div>
                    <div class="prop-row">
                      <div class="prop-field"><label>Estilo</label>
                        <select [(ngModel)]="selectedEl.lineStyle">
                          <option value="solid">Sólida</option>
                          <option value="dashed">Guiones</option>
                          <option value="dotted">Puntos</option>
                          <option value="double">Doble</option>
                          <option value="gradient">Degradado (fade)</option>
                        </select>
                      </div>
                      <div class="prop-field"><label>Grosor: {{ selectedEl.lineWidth || 2 }}px</label><input type="range" min="1" max="6" [(ngModel)]="selectedEl.lineWidth"></div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})

export class CardsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  Math = Math;
  eventId = 0; eventName = ''; eventDate = ''; eventType = '';
  guests = signal<Guest[]>([]);
  previewGuest = signal<Guest | null>(null);
  saving = signal(false); downloading = signal(false);
  saveStatus = signal<'idle' | 'saving' | 'saved' | 'error'>('idle');
  side: 'front' | 'back' | 'layout' = 'layout';
  selectedEl: CardElement | null = null;

  front: CardSide = { bgColor: '#fff8f0', bgColor2: '', bgGradientAngle: 135, bgGradientIntensity: 50, bgImage: '', bgImageOpacity: 1, borderColor: '#d4a017', borderWidth: 1, borderRadius: 4, elements: [] };
  back: CardSide = { bgColor: '#ffffff', bgColor2: '', bgGradientAngle: 135, bgGradientIntensity: 50, bgImage: '', bgImageOpacity: 1, borderColor: '#d4a017', borderWidth: 1, borderRadius: 4, elements: [] };
  cardWidth = 90;
  cardHeight = 50;
  pdfLayout = { orientation: 'portrait' as string, cardsPerPage: 6, showCutMarks: true, margin: 10, pageSize: 'letter' as string };

  currentSide(): CardSide { return this.side === 'front' ? this.front : this.back; }

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getEvent(this.eventId).subscribe(e => { this.eventName = e.name; this.eventDate = e.event_date; this.eventType = e.event_type; });
    this.api.getGuests(this.eventId).subscribe(g => { this.guests.set(g); if (g.length) this.previewGuest.set(g[0]); });
    this.api.getCardTemplate(this.eventId).subscribe(t => {
      if (t.front_config && Object.keys(t.front_config).length) {
        this.front = { ...this.front, ...t.front_config, elements: t.front_config.elements || [], bgGradientAngle: t.front_config.bgGradientAngle ?? 135, bgGradientIntensity: t.front_config.bgGradientIntensity ?? 50 };
        this.cardWidth = t.front_config.width || 90;
        this.cardHeight = t.front_config.height || 50;
        if (t.front_config.pdfLayout) this.pdfLayout = { ...this.pdfLayout, ...t.front_config.pdfLayout };
      }
      if (t.back_config && Object.keys(t.back_config).length) {
        this.back = { ...this.back, ...t.back_config, elements: t.back_config.elements || [], bgGradientAngle: t.back_config.bgGradientAngle ?? 135, bgGradientIntensity: t.back_config.bgGradientIntensity ?? 50 };
      }
    });
  }

  selectPreview(e: any) { const g = this.guests().find(x => x.id === +e.target.value); if (g) this.previewGuest.set(g); }

  getCanvasBg(): string {
    const s = this.currentSide();
    if (s.bgImage) return `url(${s.bgImage}) center/cover`;
    if (s.bgColor2) {
      const intensity = s.bgGradientIntensity ?? 50;
      return `linear-gradient(${s.bgGradientAngle || 135}deg, ${s.bgColor} ${100 - intensity}%, ${s.bgColor2} ${intensity}%)`;
    }
    return s.bgColor;
  }

  addElement(type: CardElement['type']) {
    // Calculate offset to avoid stacking on existing elements
    const existingCount = this.currentSide().elements.length;
    const offsetY = (existingCount * 12) % 60; // 12% vertical offset per element, wrap at 60%
    const offsetX = (existingCount * 4) % 20;  // slight horizontal stagger

    const el: CardElement = { id: Date.now().toString(), type, x: 5 + offsetX, y: 5 + offsetY, width: 80 };
    if (type === 'text') { el.content = '{nombre}'; el.fontSize = 14; el.fontFamily = 'sans'; el.color = '#333'; el.textAlign = 'center'; el.x = 10 + offsetX; el.y = 5 + offsetY; }
    if (type === 'qr') { el.width = 40; el.height = 60; el.x = 30 + offsetX; el.y = 5 + offsetY; el.qrColor = '#000'; el.qrBgColor = 'transparent'; el.showLabel = true; el.labelColor = '#999'; }
    if (type === 'separator') { el.y = 10 + offsetY; el.width = 80; el.x = 10 + offsetX; el.shapeColor = '#d4a017'; }
    if (type === 'image') { el.width = 30; el.height = 40; el.x = 5 + offsetX; el.y = 5 + offsetY; }
    this.currentSide().elements.push(el);
    this.selectedEl = el;
  }

  removeElement(el: CardElement) {
    const side = this.currentSide();
    side.elements = side.elements.filter(e => e.id !== el.id);
    if (this.selectedEl?.id === el.id) this.selectedEl = null;
  }

  getElIcon(type: string): string {
    const map: Record<string, string> = { text: 'text_fields', image: 'image', qr: 'qr_code', separator: 'horizontal_rule' };
    return map[type] || 'widgets';
  }

  getElLabel(el: CardElement): string {
    if (el.type === 'text') return (el.content || '').slice(0, 20) || 'Texto';
    if (el.type === 'qr') return 'Código QR';
    if (el.type === 'image') return 'Imagen';
    return 'Línea';
  }

  replaceVarsPreview(content?: string): string {
    if (!content) return '';
    const g = this.previewGuest();
    const vars: Record<string, string> = {
      '{nombre}': g?.family_name || g?.guest_names || 'Familia García',
      '{familia}': g?.family_name || 'García',
      '{invitados}': g?.guest_names || 'Juan, María',
      '{codigo}': g?.unique_code || 'ABC123',
      '{evento}': this.eventName || 'Mi Evento',
      '{fecha}': this.eventDate ? new Date(this.eventDate).toLocaleDateString('es-MX') : '01/01/2025',
      '{tipo}': this.eventType || 'Evento',
      '{asistentes}': g ? String(g.guest_type === 'family' ? g.guest_names.split(',').length : g.max_companions + 1) : '3'
    };
    let result = content;
    for (const [k, v] of Object.entries(vars)) result = result.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), v);
    return result;
  }

  getFontFamily(key?: string): string {
    const map: Record<string, string> = { sans: 'Lato, sans-serif', serif: 'Playfair Display, serif', script: 'Great Vibes, cursive', montserrat: 'Montserrat, sans-serif', raleway: 'Raleway, sans-serif', cinzel: 'Cinzel, serif', dancing: 'Dancing Script, cursive', cormorant: 'Cormorant Garamond, serif' };
    return map[key || 'sans'] || map['sans'];
  }

  round(val: number): number { return Math.round(val); }

  getSeparatorStyle(el: CardElement): string {
    const color = el.shapeColor || '#d4a017';
    const width = el.lineWidth || 2;
    const style = el.lineStyle || 'solid';
    if (style === 'gradient') {
      return `height:${width}px;background:linear-gradient(90deg, transparent, ${color}, transparent);`;
    }
    return `height:0;border-top:${width}px ${style} ${color};`;
  }

  save() {
    this.saving.set(true);
    this.saveStatus.set('saving');
    const frontData = { ...this.front, width: this.cardWidth, height: this.cardHeight, pdfLayout: this.pdfLayout };
    this.api.saveCardTemplate(this.eventId, { front_config: frontData, back_config: this.back }).subscribe({
      next: () => { this.saving.set(false); this.saveStatus.set('saved'); setTimeout(() => this.saveStatus.set('idle'), 3000); },
      error: () => { this.saving.set(false); this.saveStatus.set('error'); setTimeout(() => this.saveStatus.set('idle'), 3000); }
    });
  }

  downloadPDF() {
    this.downloading.set(true);
    this.api.downloadCardsPDF(this.eventId).subscribe({
      next: (blob) => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `invitaciones_${this.eventId}.pdf`; a.click(); this.downloading.set(false); },
      error: () => this.downloading.set(false)
    });
  }

  uploadBg(event: any) {
    const file = event.target.files[0]; if (!file) return;
    this.api.uploadFile('images', file).subscribe(r => { this.currentSide().bgImage = r.url; });
  }

  uploadElImage(event: any) {
    const file = event.target.files[0]; if (!file || !this.selectedEl) return;
    this.api.uploadFile('images', file).subscribe(r => { this.selectedEl!.imageUrl = r.url; });
  }

  applyTextPreset(event: any) {
    const val = event.target.value;
    if (!this.selectedEl || !val) return;
    if (val === '__custom__') { this.selectedEl.content = ''; }
    else { this.selectedEl.content = val; }
    event.target.value = '';
  }

  // Layout helpers
  private getPageDimensions(): { w: number; h: number } {
    const sizes: Record<string, [number, number]> = { letter: [216, 279], a4: [210, 297], legal: [216, 356] };
    const [w, h] = sizes[this.pdfLayout.pageSize] || sizes['letter'];
    return this.pdfLayout.orientation === 'landscape' ? { w: h, h: w } : { w, h };
  }

  getPageAspect(): string {
    const { w, h } = this.getPageDimensions();
    return `${w} / ${h}`;
  }

  getCardsPerPage(): number {
    const { w, h } = this.getPageDimensions();
    const m = this.pdfLayout.margin;
    const usableW = w - m * 2;
    const usableH = h - m * 2;
    const pairW = this.cardWidth * 2 + 4;
    const cols = Math.floor(usableW / pairW) || 1;
    const rows = Math.floor(usableH / (this.cardHeight + 3)) || 1;
    return cols * rows;
  }

  getPageCount(): number {
    const perPage = this.getCardsPerPage();
    return Math.ceil(this.guests().length / perPage) || 1;
  }

  getLayoutSlots(): number[] {
    return Array.from({ length: this.getCardsPerPage() }, (_, i) => i);
  }

  getSlotWidth(): number {
    const { w } = this.getPageDimensions();
    const m = this.pdfLayout.margin;
    const usableW = w - m * 2;
    const pairW = this.cardWidth * 2 + 4;
    const cols = Math.floor(usableW / pairW) || 1;
    return (100 / cols) - 2;
  }

  getSlotHeight(): number {
    const { h } = this.getPageDimensions();
    const m = this.pdfLayout.margin;
    const usableH = h - m * 2;
    const rows = Math.floor(usableH / (this.cardHeight + 3)) || 1;
    return (100 / rows) - 3;
  }

  getMarginPercent(): number {
    const { w } = this.getPageDimensions();
    return (this.pdfLayout.margin / w) * 100;
  }

  // --- Drag & Resize ---
  @ViewChild('cardCanvas') cardCanvas!: ElementRef<HTMLElement>;
  private dragging: CardElement | null = null;
  private resizing: CardElement | null = null;
  private dragStartX = 0; private dragStartY = 0;
  private elStartX = 0; private elStartY = 0;
  private elStartW = 0; private elStartH = 0;
  snapGuides: { v: number | null; h: number | null } = { v: null, h: null };

  onElMouseDown(e: MouseEvent, el: CardElement) {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    e.preventDefault();
    this.selectedEl = el;
    this.startDrag(e.clientX, e.clientY, el);
    const onMove = (ev: MouseEvent) => this.onDragMove(ev.clientX, ev.clientY);
    const onUp = () => { this.dragging = null; this.snapGuides = { v: null, h: null }; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  onElTouchStart(e: TouchEvent, el: CardElement) {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    this.selectedEl = el;
    const t = e.touches[0];
    this.startDrag(t.clientX, t.clientY, el);
    const onMove = (ev: TouchEvent) => { ev.preventDefault(); this.onDragMove(ev.touches[0].clientX, ev.touches[0].clientY); };
    const onEnd = () => { this.dragging = null; this.snapGuides = { v: null, h: null }; document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  private startDrag(clientX: number, clientY: number, el: CardElement) {
    this.dragging = el;
    this.dragStartX = clientX; this.dragStartY = clientY;
    this.elStartX = el.x; this.elStartY = el.y;
  }

  private onDragMove(clientX: number, clientY: number) {
    if (!this.dragging || !this.cardCanvas) return;
    const rect = this.cardCanvas.nativeElement.getBoundingClientRect();
    const dx = ((clientX - this.dragStartX) / rect.width) * 100;
    const dy = ((clientY - this.dragStartY) / rect.height) * 100;
    let newX = Math.round(Math.max(0, Math.min(95, this.elStartX + dx)));
    let newY = Math.round(Math.max(0, Math.min(95, this.elStartY + dy)));

    const SNAP = 2; // snap threshold %
    const elCenterX = newX + this.dragging.width / 2;
    const elCenterY = newY + (this.dragging.height || 10) / 2;
    this.snapGuides = { v: null, h: null };

    // Snap to canvas center
    if (Math.abs(elCenterX - 50) < SNAP) { newX = 50 - this.dragging.width / 2; this.snapGuides.v = 50; }
    if (Math.abs(elCenterY - 50) < SNAP) { newY = 50 - (this.dragging.height || 10) / 2; this.snapGuides.h = 50; }

    // Snap to other elements
    for (const el of this.currentSide().elements) {
      if (el.id === this.dragging.id) continue;
      const otherCenterX = el.x + el.width / 2;
      const otherCenterY = el.y + (el.height || 10) / 2;
      // Align centers
      if (Math.abs(elCenterX - otherCenterX) < SNAP) { newX = otherCenterX - this.dragging.width / 2; this.snapGuides.v = otherCenterX; }
      if (Math.abs(elCenterY - otherCenterY) < SNAP) { newY = otherCenterY - (this.dragging.height || 10) / 2; this.snapGuides.h = otherCenterY; }
      // Align edges
      if (Math.abs(newX - el.x) < SNAP) { newX = el.x; this.snapGuides.v = el.x; }
      if (Math.abs(newY - el.y) < SNAP) { newY = el.y; this.snapGuides.h = el.y; }
      if (Math.abs((newX + this.dragging.width) - (el.x + el.width)) < SNAP) { newX = el.x + el.width - this.dragging.width; this.snapGuides.v = el.x + el.width; }
    }

    this.dragging.x = Math.round(newX);
    this.dragging.y = Math.round(newY);
  }

  onResizeMouseDown(e: MouseEvent, el: CardElement) {
    e.preventDefault(); e.stopPropagation();
    this.selectedEl = el;
    this.startResize(e.clientX, e.clientY, el);
    const onMove = (ev: MouseEvent) => this.onResizeMove(ev.clientX, ev.clientY);
    const onUp = () => { this.resizing = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  onResizeTouchStart(e: TouchEvent, el: CardElement) {
    e.preventDefault(); e.stopPropagation();
    this.selectedEl = el;
    const t = e.touches[0];
    this.startResize(t.clientX, t.clientY, el);
    const onMove = (ev: TouchEvent) => { ev.preventDefault(); this.onResizeMove(ev.touches[0].clientX, ev.touches[0].clientY); };
    const onEnd = () => { this.resizing = null; document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onEnd); };
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  private startResize(clientX: number, clientY: number, el: CardElement) {
    this.resizing = el;
    this.dragStartX = clientX; this.dragStartY = clientY;
    this.elStartW = el.width; this.elStartH = el.height || 0;
  }

  private onResizeMove(clientX: number, clientY: number) {
    if (!this.resizing || !this.cardCanvas) return;
    const rect = this.cardCanvas.nativeElement.getBoundingClientRect();
    const dw = ((clientX - this.dragStartX) / rect.width) * 100;
    const dh = ((clientY - this.dragStartY) / rect.height) * 100;
    this.resizing.width = Math.round(Math.max(5, Math.min(100, this.elStartW + dw)));
    if (this.elStartH > 0 || dh > 3) {
      this.resizing.height = Math.round(Math.max(5, Math.min(100, (this.elStartH || 20) + dh)));
    }
  }
}
