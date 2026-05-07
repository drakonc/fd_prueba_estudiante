import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { EstudianteService } from '../../../core/services/estudiante.service';
import { ProgramaCreditoService } from '../../../core/services/programa-credito.service';
import { Estudiante, CrearEstudianteRequest } from '../../../core/models/estudiante.model';

@Component({
  selector: 'app-form-estudiante',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="'form-titulo'"
      style="overscroll-behavior: contain;"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl border border-white/50 p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
      >
        <div class="flex items-center gap-3 mb-5">
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (estudiante()) {
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
          <h2 id="form-titulo" class="text-lg font-bold text-gray-900">
            {{ estudiante() ? 'Editar estudiante' : 'Nuevo estudiante' }}
          </h2>
        </div>

        @if (error()) {
          <div
            role="alert"
            class="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 border border-red-200"
          >
            {{ error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
          <div>
            <label for="nombre" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Nombre completo
            </label>
            <input
              id="nombre"
              formControlName="nombre"
              type="text"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">El nombre es requerido</p>
            }
          </div>

          <div>
            <label for="email" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              formControlName="email"
              type="email"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-red-500 text-xs mt-1.5 font-medium">Ingrese un correo válido</p>
            }
          </div>

          <div>
            <label for="programaCreditoId" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Programa de crédito
            </label>
            <select
              id="programaCreditoId"
              formControlName="programaCreditoId"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Seleccione un programa</option>
              @for (p of programas(); track p.programaCreditoId) {
                <option [value]="p.programaCreditoId">{{ p.nombre }}</option>
              }
            </select>
          </div>

          <div class="flex gap-3 justify-end pt-3">
            <button
              type="button"
              (click)="cancelar.emit()"
              class="px-5 py-2.5 text-sm text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="guardando()"
              class="px-5 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/25"
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
  `,
})
export class FormEstudianteComponent implements OnInit {
  private readonly estudianteService = inject(EstudianteService);
  private readonly programaService = inject(ProgramaCreditoService);

  estudiante = input<Estudiante | null>(null);
  guardadoExitoso = output<void>();
  cancelar = output<void>();

  programas = toSignal(this.programaService.getAll().pipe(map((r) => r.datos ?? [])), {
    initialValue: [],
  });

  error = signal<string | null>(null);
  guardando = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    programaCreditoId: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    const est = this.estudiante();
    if (est) {
      this.form.patchValue({
        nombre: est.nombre,
        email: est.email,
        programaCreditoId: String(est.programaCreditoId),
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set(null);

    const body: CrearEstudianteRequest = {
      nombre: this.form.value.nombre!,
      email: this.form.value.email!,
      programaCreditoId: Number(this.form.value.programaCreditoId),
    };

    const est = this.estudiante();
    const onResult = (res: { operacionExitosa: boolean; mensaje?: string }): void => {
      if (res.operacionExitosa) {
        this.guardadoExitoso.emit();
      } else {
        this.error.set(res.mensaje ?? 'Error al guardar');
      }
      this.guardando.set(false);
    };
    const onError = (): void => {
      this.error.set('Error al conectar con el servidor');
      this.guardando.set(false);
    };

    if (est) {
      this.estudianteService
        .actualizar(est.estudianteId, body)
        .subscribe({ next: onResult, error: onError });
    } else {
      this.estudianteService.crear(body).subscribe({ next: onResult, error: onError });
    }
  }
}
