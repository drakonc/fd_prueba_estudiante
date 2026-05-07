import {
  ChangeDetectionStrategy, Component, inject, signal, OnInit
} from '@angular/core';
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
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Materias</h1>
          <p class="text-sm text-gray-500 mt-1">{{ materias().length }} registros</p>
        </div>
        <button (click)="abrirNuevo()"
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva
        </button>
      </div>

      @if (cargando()) {
        <div class="flex justify-center py-20" aria-busy="true" aria-label="Cargando">
          <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (error()) {
        <div role="alert" class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">{{ error() }}</div>
      } @else {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm" aria-label="Lista de materias">
              <thead>
                <tr class="border-b border-gray-100 text-left">
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Profesor</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Créditos</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (m of materias(); track m.materiaId) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-900 font-medium">{{ m.nombre }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ m.nombreProfesor }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ m.creditos }}</td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2">
                        <button (click)="abrirEdicion(m)"
                          class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          [attr.aria-label]="'Editar ' + m.nombre">Editar</button>
                        <button (click)="confirmarEliminar(m)"
                          class="text-sm text-red-600 hover:text-red-700 transition-colors"
                          [attr.aria-label]="'Eliminar ' + m.nombre">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-12 text-center text-gray-400">No se encontraron materias</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    @if (mostrarForm()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        role="dialog" aria-modal="true" aria-labelledby="form-materia-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
          <h2 id="form-materia-titulo" class="text-lg font-medium mb-4">
            {{ seleccionada() ? 'Editar materia' : 'Nueva materia' }}
          </h2>

          @if (errorForm()) {
            <div role="alert" class="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100">
              {{ errorForm() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="guardar()" novalidate class="space-y-4">
            <div>
              <label for="mat-nombre" class="block text-sm mb-1 text-gray-700 font-medium">Nombre</label>
              <input id="mat-nombre" formControlName="nombre" type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                <p class="text-red-600 text-xs mt-1">El nombre es requerido</p>
              }
            </div>

            <div>
              <label for="mat-creditos" class="block text-sm mb-1 text-gray-700 font-medium">Créditos</label>
              <input id="mat-creditos" formControlName="creditos" type="number" min="1"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label for="mat-profesor" class="block text-sm mb-1 text-gray-700 font-medium">Profesor</label>
              <select id="mat-profesor" formControlName="profesorId"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="">Seleccione un profesor</option>
                @for (p of profesores(); track p.profesorId) {
                  <option [value]="p.profesorId">{{ p.nombre }}</option>
                }
              </select>
            </div>

            <div>
              <label for="mat-programa" class="block text-sm mb-1 text-gray-700 font-medium">Programa de crédito</label>
              <select id="mat-programa" formControlName="programaCreditoId"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="">Seleccione un programa</option>
                @for (p of programas(); track p.programaCreditoId) {
                  <option [value]="p.programaCreditoId">{{ p.nombre }}</option>
                }
              </select>
            </div>

            <div class="flex gap-3 justify-end pt-2">
              <button type="button" (click)="cerrarForm()"
                class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" [disabled]="guardando()"
                class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {{ guardando() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (confirmarElim()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        role="dialog" aria-modal="true" aria-labelledby="elim-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h2 id="elim-titulo" class="text-lg font-medium mb-2">Eliminar materia</h2>
          <p class="text-sm text-gray-500 mb-6">
            ¿Confirma eliminar la materia <strong>{{ seleccionada()?.nombre }}</strong>?
          </p>
          <div class="flex gap-3 justify-end">
            <button (click)="confirmarElim.set(false)"
              class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button (click)="ejecutarEliminar()" [disabled]="procesando()"
              class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
              {{ procesando() ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
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

  profesores = toSignal(
    this.profesorService.getAll().pipe(map(r => r.datos ?? [])),
    { initialValue: [] }
  );
  programas = toSignal(
    this.programaService.getAll().pipe(map(r => r.datos ?? [])),
    { initialValue: [] }
  );

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    creditos: new FormControl(3, [Validators.required, Validators.min(1)]),
    profesorId: new FormControl('', [Validators.required]),
    programaCreditoId: new FormControl('', [Validators.required])
  });

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.cargando.set(true);
    this.materiaService.getAll().subscribe({
      next: res => { this.materias.set(res.datos ?? []); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar las materias'); this.cargando.set(false); }
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
      programaCreditoId: String(m.programaCreditoId)
    });
    this.errorForm.set(null);
    this.mostrarForm.set(true);
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
    this.seleccionada.set(null);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.errorForm.set(null);

    const body: CrearMateriaRequest = {
      nombre: this.form.value.nombre!,
      creditos: Number(this.form.value.creditos),
      profesorId: Number(this.form.value.profesorId),
      programaCreditoId: Number(this.form.value.programaCreditoId)
    };

    const m = this.seleccionada();
    const onResult = (res: { operacionExitosa: boolean; mensaje?: string }) => {
      if (res.operacionExitosa) { this.cerrarForm(); this.cargarDatos(); }
      else { this.errorForm.set(res.mensaje ?? 'Error al guardar'); }
      this.guardando.set(false);
    };
    const onError = () => { this.errorForm.set('Error al conectar con el servidor'); this.guardando.set(false); };

    if (m) {
      this.materiaService.actualizar(m.materiaId, body).subscribe({ next: onResult, error: onError });
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
      next: () => { this.procesando.set(false); this.confirmarElim.set(false); this.cargarDatos(); },
      error: () => { this.procesando.set(false); this.confirmarElim.set(false); }
    });
  }
}
