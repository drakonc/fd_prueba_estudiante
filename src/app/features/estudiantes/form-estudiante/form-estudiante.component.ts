import {
  ChangeDetectionStrategy, Component, inject, input, output, signal, OnInit
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
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      role="dialog" aria-modal="true" [attr.aria-labelledby]="'form-titulo'">
      <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 id="form-titulo" class="text-lg font-medium mb-4">
          {{ estudiante() ? 'Editar estudiante' : 'Nuevo estudiante' }}
        </h2>

        @if (error()) {
          <div role="alert"
            class="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100">
            {{ error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
          <div>
            <label for="nombre" class="block text-sm mb-1 text-gray-700 font-medium">
              Nombre completo
            </label>
            <input
              id="nombre"
              formControlName="nombre"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
              <p class="text-red-600 text-xs mt-1">El nombre es requerido</p>
            }
          </div>

          <div>
            <label for="email" class="block text-sm mb-1 text-gray-700 font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              formControlName="email"
              type="email"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-red-600 text-xs mt-1">Ingrese un correo válido</p>
            }
          </div>

          <div>
            <label for="programaCreditoId" class="block text-sm mb-1 text-gray-700 font-medium">
              Programa de crédito
            </label>
            <select
              id="programaCreditoId"
              formControlName="programaCreditoId"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
              <option value="">Seleccione un programa</option>
              @for (p of programas(); track p.programaCreditoId) {
                <option [value]="p.programaCreditoId">{{ p.nombre }}</option>
              }
            </select>
          </div>

          <div class="flex gap-3 justify-end pt-2">
            <button type="button"
              (click)="cancelar.emit()"
              class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              [disabled]="guardando()"
              class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FormEstudianteComponent implements OnInit {
  private readonly estudianteService = inject(EstudianteService);
  private readonly programaService = inject(ProgramaCreditoService);

  estudiante = input<Estudiante | null>(null);
  guardadoExitoso = output<void>();
  cancelar = output<void>();

  programas = toSignal(
    this.programaService.getAll().pipe(map(r => r.datos ?? [])),
    { initialValue: [] }
  );

  error = signal<string | null>(null);
  guardando = signal(false);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    programaCreditoId: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    const est = this.estudiante();
    if (est) {
      this.form.patchValue({
        nombre: est.nombre,
        email: est.email,
        programaCreditoId: String(est.programaCreditoId)
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
      programaCreditoId: Number(this.form.value.programaCreditoId)
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
      this.estudianteService.actualizar(est.estudianteId, body).subscribe({ next: onResult, error: onError });
    } else {
      this.estudianteService.crear(body).subscribe({ next: onResult, error: onError });
    }
  }
}
