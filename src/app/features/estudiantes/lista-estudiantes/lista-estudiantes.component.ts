import {
  ChangeDetectionStrategy, Component, inject, signal, OnInit
} from '@angular/core';
import { EstudianteService } from '../../../core/services/estudiante.service';
import { AuthStore } from '../../../core/store/auth.store';
import { Estudiante } from '../../../core/models/estudiante.model';
import { FormEstudianteComponent } from '../form-estudiante/form-estudiante.component';

@Component({
  selector: 'app-lista-estudiantes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormEstudianteComponent],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Estudiantes</h1>
          <p class="text-sm text-gray-500 mt-1">{{ estudiantes().length }} registros encontrados</p>
        </div>
        @if (esAdmin()) {
          <button (click)="abrirNuevo()"
            class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo
          </button>
        }
      </div>

      @if (cargando()) {
        <div class="flex justify-center py-20" aria-busy="true" aria-label="Cargando">
          <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (error()) {
        <div role="alert" class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
          {{ error() }}
        </div>
      } @else {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm" aria-label="Lista de estudiantes">
              <thead>
                <tr class="border-b border-gray-100 text-left">
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Nombre</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Correo</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Estado</th>
                  @if (esAdmin()) {
                    <th scope="col" class="px-4 py-3 font-medium text-gray-500">Acciones</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (est of estudiantes(); track est.estudianteId) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-900 font-medium">{{ est.nombre }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ est.email }}</td>
                    <td class="px-4 py-3">
                      <span [class]="est.estado
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-100'"
                        class="px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ est.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    @if (esAdmin()) {
                      <td class="px-4 py-3">
                        <div class="flex gap-2">
                          <button (click)="abrirEdicion(est)"
                            class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                            [attr.aria-label]="'Editar ' + est.nombre">
                            Editar
                          </button>
                          @if (est.estado) {
                            <button (click)="darDeBaja(est)"
                              class="text-sm text-red-600 hover:text-red-700 transition-colors"
                              [attr.aria-label]="'Dar de baja a ' + est.nombre">
                              Dar de baja
                            </button>
                          }
                        </div>
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td [attr.colspan]="esAdmin() ? 4 : 3"
                      class="px-4 py-12 text-center text-gray-400">
                      No se encontraron estudiantes
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    @if (mostrarForm()) {
      <app-form-estudiante
        [estudiante]="estudianteSeleccionado()"
        (guardadoExitoso)="onGuardado()"
        (cancelar)="cerrarForm()" />
    }

    @if (confirmarBaja()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        role="dialog" aria-modal="true" aria-labelledby="baja-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h2 id="baja-titulo" class="text-lg font-medium mb-2">Dar de baja</h2>
          <p class="text-sm text-gray-500 mb-6">
            ¿Confirma dar de baja al estudiante
            <strong>{{ estudianteSeleccionado()?.nombre }}</strong>?
          </p>
          <div class="flex gap-3 justify-end">
            <button (click)="confirmarBaja.set(false)"
              class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button (click)="ejecutarBaja()"
              [disabled]="procesando()"
              class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
              {{ procesando() ? 'Procesando...' : 'Confirmar baja' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ListaEstudiantesComponent implements OnInit {
  private readonly estudianteService = inject(EstudianteService);
  private readonly authStore = inject(AuthStore);

  esAdmin = this.authStore.esAdmin;
  estudiantes = signal<Estudiante[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  mostrarForm = signal(false);
  confirmarBaja = signal(false);
  procesando = signal(false);
  estudianteSeleccionado = signal<Estudiante | null>(null);

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.estudianteService.getAll().subscribe({
      next: res => {
        this.estudiantes.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(
          err.status === 403
            ? 'No tiene permisos para ver este recurso'
            : 'Error al cargar los datos'
        );
        this.cargando.set(false);
      }
    });
  }

  abrirNuevo(): void {
    this.estudianteSeleccionado.set(null);
    this.mostrarForm.set(true);
  }

  abrirEdicion(est: Estudiante): void {
    this.estudianteSeleccionado.set(est);
    this.mostrarForm.set(true);
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
    this.estudianteSeleccionado.set(null);
  }

  onGuardado(): void { this.cerrarForm(); this.cargarDatos(); }

  darDeBaja(est: Estudiante): void {
    this.estudianteSeleccionado.set(est);
    this.confirmarBaja.set(true);
  }

  ejecutarBaja(): void {
    const est = this.estudianteSeleccionado();
    if (!est) return;
    this.procesando.set(true);
    this.estudianteService.bajaLogica(est.estudianteId).subscribe({
      next: () => { this.procesando.set(false); this.confirmarBaja.set(false); this.cargarDatos(); },
      error: () => { this.procesando.set(false); this.confirmarBaja.set(false); }
    });
  }
}
