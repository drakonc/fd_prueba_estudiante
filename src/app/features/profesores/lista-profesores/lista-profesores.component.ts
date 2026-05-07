import {
  ChangeDetectionStrategy, Component, inject, signal, OnInit
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfesorService } from '../../../core/services/profesor.service';
import { Profesor, CrearProfesorRequest } from '../../../core/models/profesor.model';

@Component({
  selector: 'app-lista-profesores',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Profesores</h1>
          <p class="text-sm text-gray-500 mt-1">{{ profesores().length }} registros</p>
        </div>
        <button (click)="abrirNuevo()"
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
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
            <table class="w-full text-sm" aria-label="Lista de profesores">
              <thead>
                <tr class="border-b border-gray-100 text-left">
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Estado</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (p of profesores(); track p.profesorId) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-900 font-medium">{{ p.nombre }}</td>
                    <td class="px-4 py-3">
                      <span [class]="p.estado
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-100'"
                        class="px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ p.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2">
                        <button (click)="abrirEdicion(p)"
                          class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          [attr.aria-label]="'Editar ' + p.nombre">Editar</button>
                        @if (p.estado) {
                          <button (click)="confirmarBaja(p)"
                            class="text-sm text-red-600 hover:text-red-700 transition-colors"
                            [attr.aria-label]="'Dar de baja a ' + p.nombre">Dar de baja</button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="px-4 py-12 text-center text-gray-400">No se encontraron profesores</td>
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
        role="dialog" aria-modal="true" aria-labelledby="form-prof-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
          <h2 id="form-prof-titulo" class="text-lg font-medium mb-4">
            {{ seleccionado() ? 'Editar profesor' : 'Nuevo profesor' }}
          </h2>

          @if (errorForm()) {
            <div role="alert" class="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100">
              {{ errorForm() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="guardar()" novalidate class="space-y-4">
            <div>
              <label for="prof-nombre" class="block text-sm mb-1 text-gray-700 font-medium">Nombre</label>
              <input id="prof-nombre" formControlName="nombre" type="text"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                <p class="text-red-600 text-xs mt-1">El nombre es requerido</p>
              }
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

    @if (mostrarConfirmBaja()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        role="dialog" aria-modal="true" aria-labelledby="baja-prof-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h2 id="baja-prof-titulo" class="text-lg font-medium mb-2">Dar de baja</h2>
          <p class="text-sm text-gray-500 mb-6">
            ¿Confirma dar de baja al profesor <strong>{{ seleccionado()?.nombre }}</strong>?
          </p>
          <div class="flex gap-3 justify-end">
            <button (click)="mostrarConfirmBaja.set(false)"
              class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button (click)="ejecutarBaja()" [disabled]="procesando()"
              class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
              {{ procesando() ? 'Procesando...' : 'Confirmar baja' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ListaProfesoresComponent implements OnInit {
  private readonly profesorService = inject(ProfesorService);

  profesores = signal<Profesor[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  mostrarForm = signal(false);
  mostrarConfirmBaja = signal(false);
  procesando = signal(false);
  guardando = signal(false);
  errorForm = signal<string | null>(null);
  seleccionado = signal<Profesor | null>(null);

  form = new FormGroup({
    nombre: new FormControl('', [Validators.required])
  });

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.cargando.set(true);
    this.profesorService.getAll().subscribe({
      next: res => { this.profesores.set(res.datos ?? []); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar los profesores'); this.cargando.set(false); }
    });
  }

  abrirNuevo(): void {
    this.seleccionado.set(null);
    this.form.reset();
    this.errorForm.set(null);
    this.mostrarForm.set(true);
  }

  abrirEdicion(p: Profesor): void {
    this.seleccionado.set(p);
    this.form.patchValue({ nombre: p.nombre });
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

    const body: CrearProfesorRequest = { nombre: this.form.value.nombre! };
    const p = this.seleccionado();
    const onResult = (res: { operacionExitosa: boolean; mensaje?: string }) => {
      if (res.operacionExitosa) { this.cerrarForm(); this.cargarDatos(); }
      else { this.errorForm.set(res.mensaje ?? 'Error al guardar'); }
      this.guardando.set(false);
    };
    const onError = () => { this.errorForm.set('Error al conectar con el servidor'); this.guardando.set(false); };

    if (p) {
      this.profesorService.actualizar(p.profesorId, body).subscribe({ next: onResult, error: onError });
    } else {
      this.profesorService.crear(body).subscribe({ next: onResult, error: onError });
    }
  }

  confirmarBaja(p: Profesor): void {
    this.seleccionado.set(p);
    this.mostrarConfirmBaja.set(true);
  }

  ejecutarBaja(): void {
    const p = this.seleccionado();
    if (!p) return;
    this.procesando.set(true);
    this.profesorService.bajaLogica(p.profesorId).subscribe({
      next: () => { this.procesando.set(false); this.mostrarConfirmBaja.set(false); this.cargarDatos(); },
      error: () => { this.procesando.set(false); this.mostrarConfirmBaja.set(false); }
    });
  }
}
