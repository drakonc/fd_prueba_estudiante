import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { AuthStore } from '../../../core/store/auth.store';
import { InscripcionDetalle } from '../../../core/models/inscripcion.model';
import { SelectorMateriasComponent } from '../selector-materias/selector-materias.component';
import { CompanerosMateriaComponent } from '../companeros-materia/companeros-materia.component';

@Component({
  selector: 'app-mi-inscripcion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SelectorMateriasComponent, CompanerosMateriaComponent],
  template: `
    <!-- Contenedor que ocupa exactamente el alto disponible -->
    <div class="flex flex-col h-full px-8 py-6">

      <!-- Header: altura fija, no crece -->
      <header class="flex-shrink-0 mb-5">
        <p class="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-0.5">Académico</p>
        <h1 class="text-2xl font-bold text-gray-800">Mi inscripción</h1>
      </header>

      @if (cargando()) {
        <div class="flex-1 flex items-center justify-center" aria-busy="true" aria-label="Cargando">
          <div class="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (error()) {
        <div role="alert" class="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 text-sm flex-shrink-0">
          {{ error() }}
        </div>
      } @else if (!tieneExpediente()) {
        <div class="flex-1 flex items-center justify-center">
          <div class="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm w-full">
            <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <svg class="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 class="text-base font-bold text-gray-800 mb-2">Sin expediente académico</h2>
            <p class="text-sm text-gray-400 mb-6">Tu cuenta aún no tiene un expediente vinculado.</p>
            <a routerLink="/registro"
              class="inline-flex items-center px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors">
              Ir a registro en línea
            </a>
          </div>
        </div>

      } @else {
        <!-- Grid de dos columnas — ocupa el espacio restante, cada columna scrollea internamente -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 flex-1 min-h-0">

          <!-- ── Columna izquierda ── -->
          <div class="flex flex-col gap-4 overflow-y-auto min-h-0 pr-1">

            @if (inscripcion().length > 0) {
              <div class="bg-white rounded-2xl shadow-sm p-5 flex-shrink-0">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-sm font-semibold text-gray-800">Materias inscritas</h2>
                  <span class="text-xs text-gray-400 tabular-nums">
                    {{ inscripcion().length }}/3 · {{ totalCreditos() }} créditos
                  </span>
                </div>
                <ul class="space-y-1" aria-label="Materias inscritas">
                  @for (item of inscripcion(); track item.materiaId) {
                    <li class="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div class="min-w-0">
                        <p class="font-medium text-sm text-gray-900 truncate">{{ item.nombreMateria }}</p>
                        <p class="text-xs text-gray-400 mt-0.5 truncate">
                          {{ item.nombreProfesor }} · {{ item.creditos }} créditos
                        </p>
                      </div>
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">Inscrito</span>
                        <button
                          (click)="desinscribir(item.materiaId)"
                          [disabled]="quitando() !== null"
                          class="text-xs px-2.5 py-1 rounded-full font-medium border transition-colors text-red-500 border-red-100 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          [attr.aria-label]="'Quitar ' + item.nombreMateria"
                        >{{ quitando() === item.materiaId ? '…' : 'Quitar' }}</button>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            }

            @if (inscripcion().length < 3) {
              <div class="flex-shrink-0">
                <app-selector-materias
                  [estudianteId]="estudianteId()!"
                  [inscritosIds]="inscritosIds()"
                  (inscripcionExitosa)="cargarInscripcion()"
                />
              </div>
            }
          </div>

          <!-- ── Columna derecha: compañeros con scroll interno ── -->
          @if (inscripcion().length > 0) {
            <div class="bg-white rounded-2xl shadow-sm p-5 flex flex-col min-h-0">
              <h2 class="text-sm font-semibold text-gray-800 mb-4 flex-shrink-0">Compañeros de clase</h2>
              <div class="flex-1 overflow-y-auto min-h-0">
                <app-companeros-materia
                  [estudianteId]="estudianteId()!"
                  [inscripcion]="inscripcion()"
                />
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MiInscripcionComponent implements OnInit {
  private readonly inscripcionService = inject(InscripcionService);
  private readonly authStore = inject(AuthStore);

  tieneExpediente = this.authStore.tieneExpediente;
  estudianteId = this.authStore.estudianteId;
  inscripcion = signal<InscripcionDetalle[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  quitando = signal<number | null>(null);

  totalCreditos = computed(() => this.inscripcion().reduce((acc, m) => acc + m.creditos, 0));
  inscritosIds = computed(() => this.inscripcion().map((m) => m.materiaId));

  ngOnInit(): void {
    this.cargarInscripcion();
  }

  cargarInscripcion(): void {
    const id = this.estudianteId();
    if (!id) {
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);
    this.inscripcionService.getInscripcion(id).subscribe({
      next: (res) => {
        this.inscripcion.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la inscripción');
        this.cargando.set(false);
      },
    });
  }

  desinscribir(materiaId: number): void {
    const id = this.estudianteId();
    if (!id || this.quitando() !== null) return;
    this.quitando.set(materiaId);
    this.error.set(null);
    this.inscripcionService.desinscribirMateria(id, materiaId).subscribe({
      next: (res) => {
        if (res.operacionExitosa) {
          this.inscripcion.update(lista => lista.filter(m => m.materiaId !== materiaId));
        } else {
          this.error.set(res.mensaje ?? 'No se pudo quitar la materia');
        }
        this.quitando.set(null);
      },
      error: () => {
        this.error.set('Error al conectar con el servidor');
        this.quitando.set(null);
      },
    });
  }
}
