import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MateriaService } from '../../../core/services/materia.service';
import { ProfesorService } from '../../../core/services/profesor.service';
import { ProgramaCreditoService } from '../../../core/services/programa-credito.service';
import { Materia, CrearMateriaRequest } from '../../../core/models/materia.model';

@Component({
  selector: 'app-lista-materias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="px-8 py-8">
      <div class="mb-6">
        <p class="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Administración</p>
        <h1 class="text-2xl font-bold text-gray-800">Materias</h1>
      </div>

      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-500">{{ materias().length }} registros</p>
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
          Nueva
        </button>
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
      } @else {
        <div
          class="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm" aria-label="Lista de materias">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/50 text-left">
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Nombre</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Profesor</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Créditos</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (m of materias(); track m.materiaId) {
                  <tr
                    class="border-b border-gray-50/50 hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <td class="px-5 py-4 text-gray-900 font-medium">{{ m.nombre }}</td>
                    <td class="px-5 py-4 text-gray-600">{{ m.nombreProfesor }}</td>
                    <td class="px-5 py-4 text-gray-600">{{ m.creditos }}</td>
                    <td class="px-5 py-4">
                      <div class="flex gap-2">
                        <button
                          (click)="abrirEdicion(m)"
                          class="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          [attr.aria-label]="'Editar ' + m.nombre"
                        >
                          Editar
                        </button>
                        <button
                          (click)="confirmarEliminar(m)"
                          class="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          [attr.aria-label]="'Eliminar ' + m.nombre"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-5 py-16 text-center text-gray-400">
                      No se encontraron materias
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
          aria-labelledby="form-materia-titulo"
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
                  @if (seleccionada()) {
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
              <h2 id="form-materia-titulo" class="text-lg font-bold text-gray-900">
                {{ seleccionada() ? 'Editar materia' : 'Nueva materia' }}
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
                <label for="mat-nombre" class="block text-sm mb-1.5 text-gray-700 font-medium"
                  >Nombre</label
                >
                <input
                  id="mat-nombre"
                  formControlName="nombre"
                  type="text"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                  <p class="text-red-500 text-xs mt-1.5 font-medium">El nombre es requerido</p>
                }
              </div>

              <div>
                <label for="mat-creditos" class="block text-sm mb-1.5 text-gray-700 font-medium"
                  >Créditos</label
                >
                <input
                  id="mat-creditos"
                  formControlName="creditos"
                  type="number"
                  min="1"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label for="mat-profesor" class="block text-sm mb-1.5 text-gray-700 font-medium"
                  >Profesor</label
                >
                <select
                  id="mat-profesor"
                  formControlName="profesorId"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Seleccione un profesor</option>
                  @for (p of profesores(); track p.profesorId) {
                    <option [value]="p.profesorId">{{ p.nombre }}</option>
                  }
                </select>
              </div>

              <div>
                <label for="mat-programa" class="block text-sm mb-1.5 text-gray-700 font-medium"
                  >Programa de crédito</label
                >
                <select
                  id="mat-programa"
                  formControlName="programaCreditoId"
                  class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Seleccione un programa</option>
                  @for (p of programas(); track p.programaCreditoId) {
                    <option [value]="p.programaCreditoId">{{ p.nombre }}</option>
                  }
                </select>
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
          aria-labelledby="elim-titulo"
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
            <h2 id="elim-titulo" class="text-lg font-bold text-gray-900 text-center mb-2">
              Eliminar materia
            </h2>
            <p class="text-sm text-gray-500 text-center mb-6">
              ¿Confirma eliminar la materia
              <strong class="text-gray-700">{{ seleccionada()?.nombre }}</strong
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
export class ListaMateriasComponent implements OnInit {
  private readonly materiaService = inject(MateriaService);
  private readonly profesorService = inject(ProfesorService);
  private readonly programaService = inject(ProgramaCreditoService);

  materias = signal<Materia[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  mostrarForm = signal(false);
  confirmarElim = signal(false);
  procesando = signal(false);
  guardando = signal(false);
  errorForm = signal<string | null>(null);
  seleccionada = signal<Materia | null>(null);

  profesores = toSignal(this.profesorService.getAll().pipe(map((r) => r.datos ?? [])), {
    initialValue: [],
  });
  programas = toSignal(this.programaService.getAll().pipe(map((r) => r.datos ?? [])), {
    initialValue: [],
  });

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    creditos: new FormControl(3, [Validators.required, Validators.min(1)]),
    profesorId: new FormControl('', [Validators.required]),
    programaCreditoId: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.materiaService.getAll().subscribe({
      next: (res) => {
        this.materias.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las materias');
        this.cargando.set(false);
      },
    });
  }

  abrirNuevo(): void {
    this.seleccionada.set(null);
    this.form.reset({ creditos: 3 });
    this.errorForm.set(null);
    this.mostrarForm.set(true);
  }

  abrirEdicion(m: Materia): void {
    this.seleccionada.set(m);
    this.form.patchValue({
      nombre: m.nombre,
      creditos: m.creditos,
      profesorId: String(m.profesorId),
      programaCreditoId: String(m.programaCreditoId),
    });
    this.errorForm.set(null);
    this.mostrarForm.set(true);
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
    this.seleccionada.set(null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorForm.set(null);

    const body: CrearMateriaRequest = {
      nombre: this.form.value.nombre!,
      creditos: Number(this.form.value.creditos),
      profesorId: Number(this.form.value.profesorId),
      programaCreditoId: Number(this.form.value.programaCreditoId),
    };

    const m = this.seleccionada();
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

    if (m) {
      this.materiaService
        .actualizar(m.materiaId, body)
        .subscribe({ next: onResult, error: onError });
    } else {
      this.materiaService.crear(body).subscribe({ next: onResult, error: onError });
    }
  }

  confirmarEliminar(m: Materia): void {
    this.seleccionada.set(m);
    this.confirmarElim.set(true);
  }

  ejecutarEliminar(): void {
    const m = this.seleccionada();
    if (!m) return;
    this.procesando.set(true);
    this.materiaService.eliminar(m.materiaId).subscribe({
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
