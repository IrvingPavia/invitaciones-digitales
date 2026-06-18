import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../../core/services/api.service';
import { ColorPickerComponent } from '../../../core/components/color-picker.component';
import { EventConfig, CanvasElementType, ELEMENT_DEFAULTS } from '../../../core/models/models';
import { CanvasStateService } from './services/canvas-state.service';
import { MigrationService } from './services/migration.service';
import { SectionCanvasComponent } from './components/section-canvas/section-canvas.component';

interface BuilderSection {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, ColorPickerComponent, SectionCanvasComponent],
  template: `
    <!-- Toolbar -->
    <div class="builder-toolbar">
      <div class="builder-toolbar-left">
        <a routerLink="/dashboard" class="builder-back" title="Volver">
          <span class="material-icons">arrow_back</span>
        </a>
        <span class="builder-event-name">{{ eventName() }}</span>
      </div>
      <div class="builder-toolbar-center">
        <button class="builder-tb-btn" (click)="canvasState.undo()" [disabled]="!canvasState.canUndo" title="Deshacer">
          <span class="material-icons">undo</span>
        </button>
        <button class="builder-tb-btn" (click)="canvasState.redo()" [disabled]="!canvasState.canRedo" title="Rehacer">
          <span class="material-icons">redo</span>
        </button>
        <div class="builder-tb-sep"></div>
        <button class="builder-device-btn" [class.active]="previewDevice() === 'mobile'" (click)="previewDevice.set('mobile')">
          <span class="material-icons">phone_iphone</span>
        </button>
        <button class="builder-device-btn" [class.active]="previewDevice() === 'desktop'" (click)="previewDevice.set('desktop')">
          <span class="material-icons">monitor</span>
        </button>
      </div>
      <div class="builder-toolbar-right">
        <button class="builder-save-btn" (click)="save()" [disabled]="saving()">
          <span class="material-icons">{{ saveStatus() === 'saved' ? 'check_circle' : 'save' }}</span>
          <span class="builder-save-text">{{ saving() ? 'Guardando...' : saveStatus() === 'saved' ? 'Guardado' : 'Guardar' }}</span>
        </button>
      </div>
    </div>

    <div class="builder-layout">
      <!-- Left Panel: Sections + Elements -->
      <aside class="builder-panel builder-panel-left">
        <div class="builder-panel-header">
          <span class="material-icons">layers</span>
          <span>Secciones</span>
        </div>
        <div class="builder-sections-list" cdkDropList (cdkDropListDropped)="onSectionDrop($event)">
          @for (section of sections(); track section.key) {
            <div class="builder-section-item" cdkDrag
                 [class.active]="canvasState.selectedSection() === section.key"
                 [class.disabled]="!section.enabled"
                 (click)="selectSection(section.key)">
              <span class="material-icons drag-handle" cdkDragHandle>drag_indicator</span>
              <span class="material-icons section-icon">{{ section.icon }}</span>
              <span class="section-label">{{ section.label }}</span>
              <button class="section-toggle" (click)="toggleSection(section.key); $event.stopPropagation()">
                <span class="material-icons">{{ section.enabled ? 'visibility' : 'visibility_off' }}</span>
              </button>
            </div>
          }
        </div>

        <!-- Add Element buttons -->
        @if (canvasState.selectedSection()) {
          <div class="builder-add-elements">
            <div class="builder-panel-header" style="border-top: 1px solid rgba(139,92,246,0.1);">
              <span class="material-icons">add_circle</span>
              <span>Agregar elemento</span>
            </div>
            <div class="add-el-grid">
              <button class="add-el-btn" (click)="addElement('text')"><span class="material-icons">text_fields</span>Texto</button>
              <button class="add-el-btn" (click)="addElement('image')"><span class="material-icons">image</span>Imagen</button>
              <button class="add-el-btn" (click)="addElement('icon')"><span class="material-icons">emoji_emotions</span>Icono</button>
              <button class="add-el-btn" (click)="addElement('decorator')"><span class="material-icons">auto_awesome</span>Decorador</button>
              <button class="add-el-btn" (click)="addElement('separator')"><span class="material-icons">horizontal_rule</span>Separador</button>
              <button class="add-el-btn" (click)="addElement('spacer')"><span class="material-icons">height</span>Espacio</button>
            </div>
          </div>
        }
      </aside>

      <!-- Center: Canvas -->
      <div class="builder-canvas-area" (click)="onCanvasAreaClick()">
        <div class="builder-canvas-viewport" [class.mobile]="previewDevice() === 'mobile'" [class.desktop]="previewDevice() === 'desktop'">
          @if (canvasState.config()) {
            @for (section of sections(); track section.key) {
              @if (section.enabled) {
                <div class="canvas-section-wrapper"
                     [class.active-section]="canvasState.selectedSection() === section.key"
                     (click)="selectSection(section.key); $event.stopPropagation()">
                  <div class="canvas-section-label">{{ section.label }}</div>
                  <app-section-canvas
                    [sectionKey]="section.key"
                    [elements]="getSectionElements(section.key)"
                    [minHeight]="getSectionMinHeight(section.key)"
                    [background]="getSectionBg(section.key)" />
                </div>
              } @else {
                <div class="canvas-section-disabled" (click)="selectSection(section.key); $event.stopPropagation()">
                  <span class="material-icons">{{ section.icon }}</span>
                  <span>{{ section.label }} (deshabilitada)</span>
                  <button class="btn-enable" (click)="toggleSection(section.key); $event.stopPropagation()">Activar</button>
                </div>
              }
            }
          }
        </div>
      </div>

      <!-- FAB toggle props -->
      <button class="builder-props-fab" [class.active]="showProps()" (click)="showProps.set(!showProps())" title="Propiedades">
        <span class="material-icons">{{ showProps() ? 'close' : 'tune' }}</span>
      </button>

      <!-- Right Panel: Properties -->
      <aside class="builder-panel builder-panel-right" [class.panel-visible]="showProps()">
        <div class="builder-panel-header">
          <span class="material-icons">tune</span>
          <span>Propiedades</span>
        </div>
        @if (canvasState.activeElement(); as el) {
          <div class="builder-props">
            <div class="builder-section-badge">
              <span class="material-icons">{{ getElIcon(el.type) }}</span>
              <span>{{ getElLabel(el.type) }}</span>
            </div>

            <!-- Position & Size -->
            <div class="builder-prop-category">Posición y tamaño</div>
            <div class="prop-grid">
              <div class="prop-field"><label>X %</label><input type="number" [ngModel]="el.x" (ngModelChange)="updatePos('x', $event)" min="0" max="95"></div>
              <div class="prop-field"><label>Y %</label><input type="number" [ngModel]="el.y" (ngModelChange)="updatePos('y', $event)" min="0" max="95"></div>
              <div class="prop-field"><label>Ancho %</label><input type="number" [ngModel]="el.width" (ngModelChange)="updateSize('width', $event)" min="5" max="100"></div>
              <div class="prop-field"><label>Alto %</label><input type="number" [ngModel]="el.height" (ngModelChange)="updateSize('height', $event)" min="5" max="100"></div>
            </div>

            <!-- Type-specific properties -->
            @if (el.type === 'text') {
              <div class="builder-prop-category">Texto</div>
              <div class="prop-field full">
                <label>Contenido</label>
                <textarea class="builder-input" [ngModel]="$any(el).content" (ngModelChange)="updateProp('content', $event)"></textarea>
              </div>
              <div class="prop-grid">
                <div class="prop-field"><label>Tamaño</label><input type="number" [ngModel]="$any(el).fontSize" (ngModelChange)="updateProp('fontSize', +$event)" min="8" max="96"></div>
                <div class="prop-field"><label>Peso</label><input type="number" [ngModel]="$any(el).fontWeight || 400" (ngModelChange)="updateProp('fontWeight', +$event)" min="100" max="900" step="100"></div>
              </div>
              <div class="prop-field full">
                <label>Color</label>
                <app-color-picker [value]="$any(el).color || '#ffffff'" (valueChange)="updateProp('color', $event)"></app-color-picker>
              </div>
              <div class="prop-field full">
                <label>Alineación</label>
                <div class="prop-btn-row">
                  <button [class.active]="$any(el).textAlign === 'left'" (click)="updateProp('textAlign', 'left')"><span class="material-icons">format_align_left</span></button>
                  <button [class.active]="$any(el).textAlign === 'center' || !$any(el).textAlign" (click)="updateProp('textAlign', 'center')"><span class="material-icons">format_align_center</span></button>
                  <button [class.active]="$any(el).textAlign === 'right'" (click)="updateProp('textAlign', 'right')"><span class="material-icons">format_align_right</span></button>
                </div>
              </div>
            }

            @if (el.type === 'image') {
              <div class="builder-prop-category">Imagen</div>
              <div class="prop-field full">
                <label>URL de imagen</label>
                <div class="builder-upload-row">
                  @if ($any(el).imageUrl) {
                    <span class="builder-upload-ok">✔ Cargada</span>
                    <button class="builder-btn-small danger" (click)="updateProp('imageUrl', '')">Quitar</button>
                  } @else {
                    <button class="builder-btn-small" (click)="uploadForElement('imageUrl', 'images')">Subir</button>
                  }
                </div>
              </div>
              <div class="prop-grid">
                <div class="prop-field"><label>Radius</label><input type="number" [ngModel]="$any(el).borderRadius || 0" (ngModelChange)="updateProp('borderRadius', +$event)" min="0" max="50"></div>
                <div class="prop-field"><label>Opacidad</label><input type="number" [ngModel]="($any(el).opacity ?? 1) * 100" (ngModelChange)="updateProp('opacity', +$event / 100)" min="10" max="100"></div>
              </div>
            }

            @if (el.type === 'icon') {
              <div class="builder-prop-category">Icono</div>
              <div class="prop-field full">
                <label>Emoji / Icono</label>
                <input class="builder-input" [ngModel]="$any(el).icon" (ngModelChange)="updateProp('icon', $event)" placeholder="✦ o favorite">
              </div>
              <div class="prop-field full">
                <label>Color</label>
                <app-color-picker [value]="$any(el).iconColor || '#ffffff'" (valueChange)="updateProp('iconColor', $event)"></app-color-picker>
              </div>
            }

            @if (el.type === 'countdown') {
              <div class="builder-prop-category">Countdown</div>
              <div class="prop-field full">
                <label>Fecha objetivo</label>
                <input type="datetime-local" class="builder-input" [ngModel]="$any(el).targetDate" (ngModelChange)="updateProp('targetDate', $event)">
              </div>
            }

            <!-- Actions -->
            <div class="builder-prop-divider"></div>
            <div class="prop-actions">
              <button class="prop-action-btn" (click)="canvasState.bringToFront(canvasState.selectedSection()!, el.id)" title="Traer al frente">
                <span class="material-icons">flip_to_front</span>
              </button>
              <button class="prop-action-btn" (click)="canvasState.sendToBack(canvasState.selectedSection()!, el.id)" title="Enviar atrás">
                <span class="material-icons">flip_to_back</span>
              </button>
              <button class="prop-action-btn" (click)="canvasState.lockElement(canvasState.selectedSection()!, el.id, !el.locked)" title="{{ el.locked ? 'Desbloquear' : 'Bloquear' }}">
                <span class="material-icons">{{ el.locked ? 'lock_open' : 'lock' }}</span>
              </button>
              <button class="prop-action-btn danger" (click)="canvasState.removeElement(canvasState.selectedSection()!, el.id)" title="Eliminar">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>
        } @else if (canvasState.selectedSection()) {
          <div class="builder-props">
            <div class="builder-section-badge">
              <span class="material-icons">{{ getSecIcon() }}</span>
              <span>{{ getSecLabel() }}</span>
            </div>
            <p class="props-hint">Selecciona un elemento del canvas para editar sus propiedades, o agrega uno nuevo desde el panel izquierdo.</p>
          </div>
        } @else {
          <div class="builder-props-empty">
            <span class="material-icons">touch_app</span>
            <p>Selecciona una sección del canvas</p>
          </div>
        }
      </aside>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 200;
      overflow: hidden;
      background: #0a0a14;
    }
    .builder-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 16px; background: rgba(10,10,20,0.95);
      border-bottom: 1px solid rgba(139,92,246,0.15);
      z-index: 10; position: relative; height: 48px;
    }
    .builder-toolbar-left { display: flex; align-items: center; gap: 12px; }
    .builder-back {
      display: flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 8px; color: rgba(255,255,255,0.6);
      text-decoration: none; transition: all 0.2s;
      &:hover { color: white; background: rgba(139,92,246,0.15); }
    }
    .builder-event-name { font-size: 14px; font-weight: 600; color: white; }
    .builder-toolbar-center { display: flex; align-items: center; gap: 4px; }
    .builder-tb-btn {
      width: 32px; height: 32px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 18px; }
      &:hover:not(:disabled) { background: rgba(139,92,246,0.15); color: white; }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .builder-tb-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 8px; }
    .builder-device-btn {
      width: 32px; height: 32px; border-radius: 8px; border: none;
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 18px; }
      &.active { background: rgba(139,92,246,0.2); color: #c084fc; border: 1px solid rgba(139,92,246,0.4); }
      &:hover:not(.active) { background: rgba(255,255,255,0.1); color: white; }
    }
    .builder-toolbar-right { display: flex; align-items: center; }
    .builder-save-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px; border: none;
      background: linear-gradient(135deg, var(--gold), var(--gold-light));
      color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(124,92,191,0.4); }
      &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    }
    .builder-save-text { }

    .builder-layout {
      display: grid; grid-template-columns: 220px 1fr;
      height: calc(100vh - 48px); overflow: hidden; position: relative;
    }
    .builder-panel {
      background: rgba(10,10,20,0.9); backdrop-filter: blur(12px);
      border-right: 1px solid rgba(139,92,246,0.1);
      overflow-y: auto;
    }
    .builder-panel-right {
      border-right: none; border-left: 1px solid rgba(139,92,246,0.1);
      position: absolute; right: 0; top: 0; bottom: 0;
      width: 280px; z-index: 20;
      transform: translateX(100%); opacity: 0; pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s;
      transform-origin: top right;
    }
    .builder-panel-right.panel-visible { transform: translateX(0); opacity: 1; pointer-events: all; }
    .builder-panel-header {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 14px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7);
      border-bottom: 1px solid rgba(139,92,246,0.08);
      .material-icons { font-size: 16px; color: var(--gold-light); }
    }
    .builder-sections-list { padding: 6px; }
    .builder-section-item {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 10px; border-radius: 8px; margin-bottom: 2px;
      cursor: pointer; transition: all 0.15s;
      border: 1px solid transparent; font-size: 12px;
      &:hover { background: rgba(139,92,246,0.06); }
      &.active { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.3); }
      &.disabled { opacity: 0.35; }
    }
    .drag-handle { font-size: 14px; color: rgba(255,255,255,0.2); cursor: grab; }
    .section-icon { font-size: 16px; color: var(--gold-light); }
    .section-label { flex: 1; color: rgba(255,255,255,0.8); }
    .section-toggle {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: rgba(255,255,255,0.3); display: flex; transition: color 0.2s;
      .material-icons { font-size: 14px; }
      &:hover { color: var(--gold-light); }
    }
    .builder-add-elements { padding-bottom: 8px; }
    .add-el-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 6px; }
    .add-el-btn {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 8px 4px; border-radius: 8px; border: 1px solid rgba(139,92,246,0.1);
      background: rgba(139,92,246,0.03); color: rgba(255,255,255,0.6);
      font-size: 10px; cursor: pointer; transition: all 0.2s;
      .material-icons { font-size: 18px; color: rgba(139,92,246,0.5); }
      &:hover { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.3); color: white; }
    }

    .builder-canvas-area {
      display: flex; align-items: flex-start; justify-content: center;
      background: #06060e; padding: 16px; overflow-y: auto;
    }
    .builder-canvas-viewport {
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.06);
      transition: width 0.3s; background: #0d1117;
      &.mobile { width: 375px; }
      &.desktop { width: 100%; max-width: 680px; }
    }
    .canvas-section-wrapper {
      position: relative; cursor: default;
      border: 1px solid transparent; transition: border-color 0.15s;
      &:hover { border-color: rgba(139,92,246,0.15); }
      &.active-section { border-color: rgba(139,92,246,0.4); }
    }
    .canvas-section-label {
      position: absolute; top: 2px; left: 2px; z-index: 10;
      font-size: 9px; padding: 1px 6px; border-radius: 3px;
      background: rgba(139,92,246,0.8); color: white; font-weight: 600;
      opacity: 0; transition: opacity 0.2s; pointer-events: none;
    }
    .canvas-section-wrapper:hover .canvas-section-label,
    .canvas-section-wrapper.active-section .canvas-section-label { opacity: 1; }
    .canvas-section-disabled {
      display: flex; align-items: center; gap: 8px; padding: 12px 16px;
      color: rgba(255,255,255,0.25); font-size: 11px; cursor: pointer;
      border: 1px dashed rgba(139,92,246,0.1); transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(139,92,246,0.03); border-color: rgba(139,92,246,0.2); color: rgba(255,255,255,0.4); }
    }
    .btn-enable {
      margin-left: auto; padding: 3px 8px; border-radius: 4px;
      border: 1px solid rgba(139,92,246,0.3); background: rgba(139,92,246,0.1);
      color: #c084fc; font-size: 10px; cursor: pointer;
      &:hover { background: rgba(139,92,246,0.2); }
    }

    .builder-props-fab {
      position: absolute; top: 8px; right: 8px; z-index: 25;
      width: 36px; height: 36px; border-radius: 50%; border: none;
      background: rgba(139,92,246,0.9); color: white;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(139,92,246,0.4);
      transition: transform 0.3s, background 0.2s;
      .material-icons { font-size: 18px; transition: transform 0.3s; }
      &:hover { transform: scale(1.1); }
      &.active { background: rgba(239,68,68,0.85); }
      &.active .material-icons { transform: rotate(90deg); }
    }

    .builder-props { padding: 14px; }
    .builder-section-badge {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px; margin-bottom: 12px;
      background: rgba(139,92,246,0.08); border-radius: 8px;
      border: 1px solid rgba(139,92,246,0.2);
      .material-icons { font-size: 16px; color: var(--gold-light); }
      span:last-child { font-size: 13px; font-weight: 600; color: white; }
    }
    .builder-prop-category {
      font-size: 10px; color: rgba(139,92,246,0.8); text-transform: uppercase;
      letter-spacing: 0.8px; font-weight: 700; margin: 14px 0 8px; padding-left: 2px;
    }
    .prop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .prop-field {
      display: flex; flex-direction: column; gap: 3px;
      label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
      input, textarea, select {
        width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(139,92,246,0.2);
        border-radius: 6px; padding: 7px 9px; color: white; font-size: 12px;
        font-family: var(--font-sans);
        &:focus { outline: none; border-color: rgba(139,92,246,0.5); }
      }
      textarea { min-height: 60px; resize: vertical; }
    }
    .prop-field.full { grid-column: 1 / -1; margin-bottom: 10px; }
    .prop-btn-row {
      display: flex; gap: 4px;
      button {
        padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5);
        cursor: pointer; display: flex; align-items: center; transition: all 0.2s;
        .material-icons { font-size: 16px; }
        &:hover { background: rgba(139,92,246,0.1); color: white; }
        &.active { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.5); color: #c084fc; }
      }
    }
    .builder-prop-divider { height: 1px; background: rgba(139,92,246,0.1); margin: 14px 0; }
    .prop-actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .prop-action-btn {
      width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      .material-icons { font-size: 16px; }
      &:hover { background: rgba(139,92,246,0.1); color: white; border-color: rgba(139,92,246,0.3); }
      &.danger:hover { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3); }
    }
    .builder-props-empty {
      padding: 40px 14px; text-align: center;
      .material-icons { font-size: 32px; color: rgba(139,92,246,0.3); margin-bottom: 10px; }
      p { font-size: 12px; color: rgba(255,255,255,0.3); }
    }
    .props-hint { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.6; }
    .builder-input {
      width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(139,92,246,0.2);
      border-radius: 6px; padding: 8px 10px; color: white; font-size: 12px;
      font-family: var(--font-sans);
      &:focus { outline: none; border-color: rgba(139,92,246,0.5); }
    }
    .builder-upload-row { display: flex; align-items: center; gap: 8px; }
    .builder-upload-ok { font-size: 11px; color: #10b981; }
    .builder-btn-small {
      padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(139,92,246,0.3);
      background: rgba(139,92,246,0.1); color: rgba(255,255,255,0.8);
      font-size: 11px; cursor: pointer; transition: all 0.2s;
      &:hover { background: rgba(139,92,246,0.2); }
      &.danger { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); color: #ef4444; }
    }

    /* CDK Drag */
    .cdk-drag-preview { border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .cdk-drag-placeholder { opacity: 0.3; }

    @media (max-width: 768px) {
      .builder-layout { grid-template-columns: 1fr; }
      .builder-panel-left { display: none; }
      .builder-save-text { display: none; }
      .builder-canvas-viewport.mobile { width: 100%; border-radius: 0; }
    }
  `]
})
export class BuilderComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  canvasState = inject(CanvasStateService);
  private migration = inject(MigrationService);

  eventId = 0;
  eventName = signal('');
  sections = signal<BuilderSection[]>([]);
  previewDevice = signal<'mobile' | 'desktop'>('mobile');
  saving = signal(false);
  saveStatus = signal<'idle' | 'saved'>('idle');
  showProps = signal(false);
  private autoSaveTimer: any = null;

  hasUnsavedChanges(): boolean { return this.canvasState.isDirty(); }

  ngOnInit() {
    this.eventId = +this.route.snapshot.params['eventId'];
    this.api.getEvent(this.eventId).subscribe(e => this.eventName.set(e.name));
    this.api.getConfig(this.eventId).subscribe(c => {
      const cfg = c.config_json;
      // Migrate to V2 with canvas data
      const v2 = this.migration.migrateConfig(cfg);
      this.canvasState.initializeState(v2);
      this.buildSections(v2);
    });
  }

  ngOnDestroy() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
  }

  private buildSections(cfg: any) {
    this.sections.set([
      { key: 'hero', label: 'Carátula', icon: 'image', enabled: true },
      { key: 'invitation', label: 'Invitación', icon: 'card_giftcard', enabled: true },
      { key: 'details', label: 'Detalles', icon: 'info', enabled: cfg.details?.enabled ?? false },
      { key: 'venues', label: 'Lugares', icon: 'place', enabled: cfg.venues?.enabled ?? false },
      { key: 'itinerary', label: 'Itinerario', icon: 'schedule', enabled: cfg.itinerary?.enabled ?? false },
      { key: 'gallery', label: 'Galería', icon: 'photo_library', enabled: cfg.gallery?.enabled ?? false },
      { key: 'dresscode', label: 'Vestimenta', icon: 'checkroom', enabled: cfg.dresscode?.enabled ?? false },
      { key: 'gifts', label: 'Regalos', icon: 'redeem', enabled: cfg.gifts?.enabled ?? false },
      { key: 'rsvp', label: 'Confirmación', icon: 'how_to_reg', enabled: cfg.rsvp?.enabled ?? false },
    ]);
  }

  selectSection(key: string) {
    this.canvasState.selectSection(key);
    this.showProps.set(true);
  }

  onCanvasAreaClick() {
    this.canvasState.selectSection(null);
  }

  toggleSection(key: string) {
    const s = this.sections();
    const idx = s.findIndex(x => x.key === key);
    if (idx >= 0) {
      s[idx].enabled = !s[idx].enabled;
      this.sections.set([...s]);
      // Update config
      const cfg = this.canvasState.getConfig();
      if (cfg && (cfg as any)[key]) {
        (cfg as any)[key].enabled = s[idx].enabled;
        this.canvasState.isDirty.set(true);
      }
      this.scheduleAutoSave();
    }
  }

  onSectionDrop(event: CdkDragDrop<BuilderSection[]>) {
    const s = this.sections();
    moveItemInArray(s, event.previousIndex, event.currentIndex);
    this.sections.set([...s]);
    this.canvasState.isDirty.set(true);
    this.scheduleAutoSave();
  }

  addElement(type: CanvasElementType) {
    const sectionKey = this.canvasState.selectedSection();
    if (!sectionKey) return;
    const id = this.canvasState.addElement(sectionKey, type);
    if (id) {
      this.canvasState.selectElement(sectionKey, id);
      this.showProps.set(true);
    }
    this.scheduleAutoSave();
  }

  // ===== Properties Panel =====

  updatePos(axis: 'x' | 'y', value: number) {
    const sec = this.canvasState.selectedSection();
    const el = this.canvasState.activeElement();
    if (!sec || !el) return;
    const x = axis === 'x' ? value : el.x;
    const y = axis === 'y' ? value : el.y;
    this.canvasState.updateElementPosition(sec, el.id, x, y);
    this.scheduleAutoSave();
  }

  updateSize(dim: 'width' | 'height', value: number) {
    const sec = this.canvasState.selectedSection();
    const el = this.canvasState.activeElement();
    if (!sec || !el) return;
    const w = dim === 'width' ? value : el.width;
    const h = dim === 'height' ? value : el.height;
    this.canvasState.resizeElement(sec, el.id, w, h);
    this.scheduleAutoSave();
  }

  updateProp(prop: string, value: any) {
    const sec = this.canvasState.selectedSection();
    const el = this.canvasState.activeElement();
    if (!sec || !el) return;
    this.canvasState.updateElementProperties(sec, el.id, { [prop]: value } as any);
    this.scheduleAutoSave();
  }

  uploadForElement(prop: string, type: 'images' | 'audio' | 'gifs') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'audio' ? 'audio/*' : 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      this.api.uploadFile(type, file).subscribe({
        next: (res) => { this.updateProp(prop, res.url); }
      });
    };
    input.click();
  }

  // ===== Canvas Helpers =====

  getSectionElements(key: string): any[] {
    const cfg = this.canvasState.config();
    if (!cfg) return [];
    const section = (cfg as any)[key];
    return section?.canvas?.elements || [];
  }

  getSectionMinHeight(key: string): number {
    const cfg = this.canvasState.config();
    if (!cfg) return 60;
    const section = (cfg as any)[key];
    return section?.canvas?.minHeight || 60;
  }

  getSectionBg(key: string): string {
    const cfg = this.canvasState.config();
    if (!cfg) return '';
    const section = (cfg as any)[key];
    const style = section?.sectionStyle;
    if (!style || style.bgType === 'inherit') {
      // Use landing bg
      const theme = cfg.theme;
      const c1 = theme?.landingBgColor1 || '#0d1117';
      return c1;
    }
    switch (style.bgType) {
      case 'solid': return style.bgColor1 || '#0d1117';
      case 'linear': return `linear-gradient(${style.bgAngle || 180}deg, ${style.bgColor1 || '#fff'}, ${style.bgColor2 || '#eee'})`;
      default: return '';
    }
  }

  getElIcon(type: string): string {
    const m: Record<string, string> = {
      'text': 'text_fields', 'image': 'image', 'icon': 'emoji_emotions', 'decorator': 'auto_awesome',
      'countdown': 'timer', 'gallery': 'photo_library', 'detail-cards': 'info', 'venue-cards': 'place',
      'itinerary': 'schedule', 'rsvp-form': 'how_to_reg', 'gifts-block': 'redeem',
      'dresscode-block': 'checkroom', 'separator': 'horizontal_rule', 'spacer': 'height'
    };
    return m[type] || 'widgets';
  }

  getElLabel(type: string): string {
    const m: Record<string, string> = {
      'text': 'Texto', 'image': 'Imagen', 'icon': 'Icono', 'decorator': 'Decorador',
      'countdown': 'Countdown', 'gallery': 'Galería', 'detail-cards': 'Detalles', 'venue-cards': 'Lugares',
      'itinerary': 'Itinerario', 'rsvp-form': 'Confirmación', 'gifts-block': 'Regalos',
      'dresscode-block': 'Vestimenta', 'separator': 'Separador', 'spacer': 'Espacio'
    };
    return m[type] || type;
  }

  getSecIcon(): string {
    const sec = this.sections().find(s => s.key === this.canvasState.selectedSection());
    return sec?.icon || 'layers';
  }

  getSecLabel(): string {
    const sec = this.sections().find(s => s.key === this.canvasState.selectedSection());
    return sec?.label || '';
  }

  // ===== Save =====

  save() {
    this.saving.set(true);
    const cfg = this.canvasState.getConfig();
    if (!cfg) { this.saving.set(false); return; }
    // Sync enabled states
    const s = this.sections();
    for (const sec of s) {
      if ((cfg as any)[sec.key] && typeof (cfg as any)[sec.key] === 'object') {
        (cfg as any)[sec.key].enabled = sec.enabled;
      }
    }
    this.api.saveConfig(this.eventId, cfg).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveStatus.set('saved');
        this.canvasState.isDirty.set(false);
        setTimeout(() => this.saveStatus.set('idle'), 3000);
      },
      error: () => { this.saving.set(false); }
    });
  }

  private scheduleAutoSave() {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      if (this.canvasState.isDirty() && !this.saving()) {
        this.save();
      }
    }, 4000);
  }
}
