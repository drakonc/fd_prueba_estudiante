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
    <div class="max-w-3xl mx-auto px-6 py-8">
      <div class="flex items-center gap-3 mb-6">
        <a
          routerLink="/inicio"
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200"
          aria-label="Volver al inicio"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </a>
        <h1
          class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Mi inscripción
        </h1>
      </div>

      @if (cargando()) {
        <div class="flex justify-center py-20" aria-busy="true" aria-label="Cargando">
          <div
            class="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      } @else if (error()) {
        <div role="alert" class="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-200">
          {{ error() }}
        </div>
      } @else if (!tieneExpediente()) {
        <div
          class="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-xl shadow-gray-200/30 p-8 text-center"
        >
          <div
            class="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <svg
              class="w-7 h-7 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 mb-2">Sin expediente académico</h2>
          <p class="text-sm text-gray-500 mb-6">
            Tu cuenta aún no tiene un expediente académico vinculado. Regístrate para crear tu
            perfil de estudiante.
          </p>
          <a
            routerLink="/registro"
            class="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            Ir a registro en línea
          </a>
        </div>
      } @else {
        @if (inscripcion().length > 0) {
          <div
            class="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-xl shadow-gray-200/30 p-6 mb-4"
          >
            <h2 class="text-base font-semibold text-gray-900 mb-4">Mis materias inscritas</h2>
            <div class="space-y-2">
              @for (item of inscripcion(); track item.materiaId) {
                <div
                  class="flex items-center justify-between py-3 border-b border-gray-50/50 last:border-0 hover:bg-blue-50/30 transition-colors rounded-lg px-2 -mx-2"
                >
                  <div>
                    <p class="font-medium text-sm text-gray-900">{{ item.nombreMateria }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ item.nombreProfesor }} · {{ item.creditos }} créditos
                    </p>
                  </div>
                  <button
                    (click)="desinscribir(item.materiaId)"
                    [disabled]="quitando() !== null"
                    class="text-xs px-3 py-1 rounded-full font-semibold border transition-colors
                      bg-red-50 text-red-600 border-red-200 hover:bg-red-100
                      disabled:opacity-40 disabled:cursor-not-allowed"
                    [attr.aria-label]="'Quitar ' + item.nombreMateria"
                  >
                    {{ quitando() === item.materiaId ? 'Quitando...' : 'Quitar' }}
                  </button>
                </div>
              }
            </div>
            <p class="text-xs text-gray-400 mt-4">
              Total: {{ inscripcion().length }} materias · {{ totalCreditos() }} créditos
            </p>
          </div>
        }

        @if (inscripcion().length < 3) {
          <app-selector-materias
            [estudianteId]="estudianteId()!"
            [inscritosIds]="inscritosIds()"
            (inscripcionExitosa)="cargarInscripcion()"
          />
        }

        @if (inscripcion().length > 0) {
          <div class="mt-4">
            <app-companeros-materia [estudianteId]="estudianteId()!" [inscripcion]="inscripcion()" />
          </div>
        }
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
