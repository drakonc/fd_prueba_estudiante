import {
  ChangeDetectionStrategy, Component, inject, signal, OnInit
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgramaCreditoService } from '../../../core/services/programa-credito.service';
import { ProgramaCredito, CrearProgramaRequest } from '../../../core/models/programa-credito.model';

@Component({
  selector: 'app-lista-programas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Programas de crédito</h1>
          <p class="text-sm text-gray-500 mt-1">{{ programas().length }} programas</p>
        </div>
        <button (click)="abrirNuevo()"
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      @if (error()) {
        <div role="alert" class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">{{ error() }}</div>
      } @else if (cargando()) {
        <div class="flex justify-center py-20" aria-busy="true" aria-label="Cargando">
          <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm" aria-label="Lista de programas de crédito">
              <thead>
                <tr class="border-b border-gray-100 text-left">
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Créditos por materia</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Máx. materias</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (p of programas(); track p.programaCreditoId) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-900 font-medium">{{ p.nombre }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ p.creditosPorMateria }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ p.maxMateriasPorEstudiante }}</td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2">
                        <button (click)="abrirEdicion(p)"
                          class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          [attr.aria-label]="'Editar ' + p.nombre">Editar</button>
                        <button (click)="confirmarEliminar(p)"
                          class="text-sm text-red-600 hover:text-red-700 transition-colors"
                          [attr.aria-label]="'Eliminar ' + p.nombre">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-12 text-center text-gray-400">No se encontraron programas</td>
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
        role="dialog" aria-modal="true" aria-labelledby="form-prog-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
          <h2 id="form-prog-titulo" class="text-lg font-medium mb-4">
            {{ seleccionado() ? 'Editar programa' : 'Nuevo programa' }}
          </h2>

          @if (errorForm()) {
            <div role="alert" class="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100">
              {{ errorForm() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="guardar()" novalidate class="space-y-4">
            <div>
              <label for="prog-nombre" class="block text-sm mb-1 text-gray-700 font-medium">Nombre</label>
              <input id="prog-nombre" formControlName="nombre" type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                <p class="text-red-600 text-xs mt-1">El nombre es requerido</p>
              }
            </div>

            <div>
              <label for="prog-creditos" class="block text-sm mb-1 text-gray-700 font-medium">Créditos por materia</label>
              <input id="prog-creditos" formControlName="creditosPorMateria" type="number" min="1"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label for="prog-max" class="block text-sm mb-1 text-gray-700 font-medium">Máximo de materias por estudiante</label>
              <input id="prog-max" formControlName="maxMateriasPorEstudiante" type="number" min="1"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
        role="dialog" aria-modal="true" aria-labelledby="elim-prog-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h2 id="elim-prog-titulo" class="text-lg font-medium mb-2">Eliminar programa</h2>
          <p class="text-sm text-gray-500 mb-6">
            ¿Confirma eliminar el programa <strong>{{ seleccionado()?.nombre }}</strong>?
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
    maxMateriasPorEstudiante: new FormControl(3, [Validators.required, Validators.min(1)])
  });

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.cargando.set(true);
    this.programaService.getAll().subscribe({
      next: res => { this.programas.set(res.datos ?? []); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar los programas'); this.cargando.set(false); }
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
      maxMateriasPorEstudiante: p.maxMateriasPorEstudiante
    });
    this.errorForm.set(null);
    this.mostrarForm.set(true);
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
    this.seleccionado.set(null);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.errorForm.set(null);

    const body: CrearProgramaRequest = {
      nombre: this.form.value.nombre!,
      creditosPorMateria: Number(this.form.value.creditosPorMateria),
      maxMateriasPorEstudiante: Number(this.form.value.maxMateriasPorEstudiante)
    };

    const p = this.seleccionado();
    const onResult = (res: { operacionExitosa: boolean; mensaje?: string }) => {
      if (res.operacionExitosa) { this.cerrarForm(); this.cargarDatos(); }
      else { this.errorForm.set(res.mensaje ?? 'Error al guardar'); }
      this.guardando.set(false);
    };
    const onError = () => { this.errorForm.set('Error al conectar con el servidor'); this.guardando.set(false); };

    if (p) {
      this.programaService.actualizar(p.programaCreditoId, body).subscribe({ next: onResult, error: onError });
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
      next: () => { this.procesando.set(false); this.confirmarElim.set(false); this.cargarDatos(); },
      error: () => { this.procesando.set(false); this.confirmarElim.set(false); }
    });
  }
}
