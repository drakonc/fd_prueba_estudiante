import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgramaCreditoService } from '../../../core/services/programa-credito.service';
import { ProgramaCredito, CrearProgramaRequest } from '../../../core/models/programa-credito.model';

@Component({
  selector: 'app-lista-programas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="px-8 py-8">
      <div class="mb-6">
        <p class="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Administración</p>
        <h1 class="text-2xl font-bold text-gray-800">Programas de crédito</h1>
      </div>

      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-500">{{ programas().length }} programas</p>
        <button
          (click)="abrirNuevo()"
          class="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 flex items-center gap-2 shadow-sm shadow-blue-500/30"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo
        </button>
      </div>

      @if (error()) {
        <div role="alert" class="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-200">
          {{ error() }}
        </div>
      } @else if (cargando()) {
        <div class="flex justify-center py-20" aria-busy="true" aria-label="Cargando">
          <div
            class="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      } @else {
        <div
          class="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm" aria-label="Lista de programas de crédito">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/50 text-left">
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Nombre</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">
                    Créditos por materia
                  </th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Máx. materias</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (p of programas(); track p.programaCreditoId) {
                  <tr
                    class="border-b border-gray-50/50 hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <td class="px-5 py-4 text-gray-900 font-medium">{{ p.nombre }}</td>
                    <td class="px-5 py-4 text-gray-600">{{ p.creditosPorMateria }}</td>
                    <td class="px-5 py-4 text-gray-600">{{ p.maxMateriasPorEstudiante }}</td>
                    <td class="px-5 py-4">
                      <div class="flex gap-2">
                        <button
                          (click)="abrirEdicion(p)"
                          class="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          [attr.aria-label]="'Editar ' + p.nombre"
                        >
                          Editar
                        </button>
                        <button
                          (click)="confirmarEliminar(p)"
                          class="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          [attr.aria-label]="'Eliminar ' + p.nombre"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-5 py-16 text-center text-gray-400">
                      No se encontraron programas
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
      @if (mostrarForm()) {
        <div
          class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-prog-titulo"
          style="overscroll-behavior: contain;"
        >
          <div
            class="bg-white rounded-3xl shadow-2xl border border-white/50 p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div class="flex items-center gap-3 mb-5">
              <div
                class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  @if (seleccionado()) {
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  } @else {
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  }
                </svg>
              </div>
              <h2 id="form-prog-titulo" class="text-lg font-bold text-gray-900">
                {{ seleccionado() ? 'Editar programa' : 'Nuevo programa' }}
              </h2>
            </div>

            @if (errorForm()) {
              <div
                role="alert"
                class="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 border border-red-200"
              >
                {{ errorForm() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="guardar()" novalidate class="space-y-4">
              <div>
                <label for="prog-nombre" class="block text-sm mb-1.5 text-gray-700 font-medium"
                  >Nombre</label
                >
                <input
                  id="prog-nombre"
                  formControlName="nombre"
                  type="text"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                  <p class="text-red-500 text-xs mt-1.5 font-medium">El nombre es requerido</p>
                }
              </div>

              <div>
                <label for="prog-creditos" class="block text-sm mb-1.5 text-gray-700 font-medium"
                  >Créditos por materia</label
                >
                <input
                  id="prog-creditos"
                  formControlName="creditosPorMateria"
                  type="number"
                  min="1"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label for="prog-max" class="block text-sm mb-1.5 text-gray-700 font-medium"
                  >Máximo de materias por estudiante</label
                >
                <input
                  id="prog-max"
                  formControlName="maxMateriasPorEstudiante"
                  type="number"
                  min="1"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  (click)="cerrarForm()"
                  class="flex-1 px-4 py-2.5 text-sm text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="guardando()"
                  class="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  @if (guardando()) {
                    <span class="flex items-center justify-center gap-2">
                      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Guardando…
                    </span>
                  } @else {
                    Guardar
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (confirmarElim()) {
        <div
          class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="elim-prog-titulo"
          style="overscroll-behavior: contain;"
        >
          <div
            class="bg-white rounded-3xl shadow-2xl border border-white/50 p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div
              class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-7 h-7 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h2 id="elim-prog-titulo" class="text-lg font-bold text-gray-900 text-center mb-2">
              Eliminar programa
            </h2>
            <p class="text-sm text-gray-500 text-center mb-6">
              ¿Confirma eliminar el programa
              <strong class="text-gray-700">{{ seleccionado()?.nombre }}</strong
              >?
            </p>
            <div class="flex gap-3">
              <button
                (click)="confirmarElim.set(false)"
                class="flex-1 px-4 py-2.5 text-sm text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                (click)="ejecutarEliminar()"
                [disabled]="procesando()"
                class="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors shadow-lg shadow-red-500/25"
              >
                @if (procesando()) {
                  <span class="flex items-center justify-center gap-2">
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Eliminando…
                  </span>
                } @else {
                  Eliminar
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ListaProgramasComponent implements OnInit {
  private readonly programaService = inject(ProgramaCreditoService);

  programas = signal<ProgramaCredito[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  mostrarForm = signal(false);
  confirmarElim = signal(false);
  procesando = signal(false);
  guardando = signal(false);
  errorForm = signal<string | null>(null);
  seleccionado = signal<ProgramaCredito | null>(null);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    creditosPorMateria: new FormControl(3, [Validators.required, Validators.min(1)]),
    maxMateriasPorEstudiante: new FormControl(3, [Validators.required, Validators.min(1)]),
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.programaService.getAll().subscribe({
      next: (res) => {
        this.programas.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los programas');
        this.cargando.set(false);
      },
    });
  }

  abrirNuevo(): void {
    this.seleccionado.set(null);
    this.form.reset({ creditosPorMateria: 3, maxMateriasPorEstudiante: 3 });
    this.errorForm.set(null);
    this.mostrarForm.set(true);
  }

  abrirEdicion(p: ProgramaCredito): void {
    this.seleccionado.set(p);
    this.form.patchValue({
      nombre: p.nombre,
      creditosPorMateria: p.creditosPorMateria,
      maxMateriasPorEstudiante: p.maxMateriasPorEstudiante,
    });
    this.errorForm.set(null);
    this.mostrarForm.set(true);
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
    this.seleccionado.set(null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorForm.set(null);

    const body: CrearProgramaRequest = {
      nombre: this.form.value.nombre!,
      creditosPorMateria: Number(this.form.value.creditosPorMateria),
      maxMateriasPorEstudiante: Number(this.form.value.maxMateriasPorEstudiante),
    };

    const p = this.seleccionado();
    const onResult = (res: { operacionExitosa: boolean; mensaje?: string }) => {
      if (res.operacionExitosa) {
        this.cerrarForm();
        this.cargarDatos();
      } else {
        this.errorForm.set(res.mensaje ?? 'Error al guardar');
      }
      this.guardando.set(false);
    };
    const onError = () => {
      this.errorForm.set('Error al conectar con el servidor');
      this.guardando.set(false);
    };

    if (p) {
      this.programaService
        .actualizar(p.programaCreditoId, body)
        .subscribe({ next: onResult, error: onError });
    } else {
      this.programaService.crear(body).subscribe({ next: onResult, error: onError });
    }
  }

  confirmarEliminar(p: ProgramaCredito): void {
    this.seleccionado.set(p);
    this.confirmarElim.set(true);
  }

  ejecutarEliminar(): void {
    const p = this.seleccionado();
    if (!p) return;
    this.procesando.set(true);
    this.programaService.eliminar(p.programaCreditoId).subscribe({
      next: () => {
        this.procesando.set(false);
        this.confirmarElim.set(false);
        this.cargarDatos();
      },
      error: () => {
        this.procesando.set(false);
        this.confirmarElim.set(false);
      },
    });
  }
}
