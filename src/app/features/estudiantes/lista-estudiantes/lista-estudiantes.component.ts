import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstudianteService } from '../../../core/services/estudiante.service';
import { AuthStore } from '../../../core/store/auth.store';
import { Estudiante } from '../../../core/models/estudiante.model';
import { FormEstudianteComponent } from '../form-estudiante/form-estudiante.component';

@Component({
  selector: 'app-lista-estudiantes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormEstudianteComponent, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
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
          <div>
            <h1
              class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Estudiantes
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ estudiantes().length }} registros encontrados
            </p>
          </div>
        </div>
        @if (esAdmin()) {
          <button
            (click)="abrirNuevo()"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/25"
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
        }
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
          class="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-xl shadow-gray-200/30 overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm" aria-label="Lista de estudiantes">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/50 text-left">
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Nombre</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Correo</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Estado</th>
                  @if (esAdmin()) {
                    <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Acciones</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (est of estudiantes(); track est.estudianteId) {
                  <tr
                    class="border-b border-gray-50/50 hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <td class="px-5 py-4 text-gray-900 font-medium">{{ est.nombre }}</td>
                    <td class="px-5 py-4 text-gray-600">{{ est.email }}</td>
                    <td class="px-5 py-4">
                      <span
                        [class]="
                          est.estado
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        "
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {{ est.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    @if (esAdmin()) {
                      <td class="px-5 py-4">
                        <div class="flex gap-2">
                          <button
                            (click)="abrirEdicion(est)"
                            class="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            [attr.aria-label]="'Editar ' + est.nombre"
                          >
                            Editar
                          </button>
                          @if (est.estado) {
                            <button
                              (click)="darDeBaja(est)"
                              class="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                              [attr.aria-label]="'Dar de baja a ' + est.nombre"
                            >
                              Dar de baja
                            </button>
                          }
                        </div>
                      </td>
                    }
                  </tr>
                } @empty {
                  <tr>
                    <td
                      [attr.colspan]="esAdmin() ? 4 : 3"
                      class="px-5 py-16 text-center text-gray-400"
                    >
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
        (cancelar)="cerrarForm()"
      />
    }

    @if (confirmarBaja()) {
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="baja-titulo"
        style="overscroll-behavior: contain;"
      >
        <div
          class="bg-white rounded-3xl shadow-2xl border border-white/50 p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div
            class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 id="baja-titulo" class="text-lg font-bold text-gray-900 text-center mb-2">
            Dar de baja
          </h2>
          <p class="text-sm text-gray-500 text-center mb-6">
            ¿Confirma dar de baja al estudiante
            <strong class="text-gray-700">{{ estudianteSeleccionado()?.nombre }}</strong
            >?
          </p>
          <div class="flex gap-3">
            <button
              (click)="confirmarBaja.set(false)"
              class="flex-1 px-4 py-2.5 text-sm text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="ejecutarBaja()"
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
                  Procesando…
                </span>
              } @else {
                Confirmar baja
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
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

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.estudianteService.getAll().subscribe({
      next: (res) => {
        this.estudiantes.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(
          err.status === 403
            ? 'No tiene permisos para ver este recurso'
            : 'Error al cargar los datos',
        );
        this.cargando.set(false);
      },
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

  onGuardado(): void {
    this.cerrarForm();
    this.cargarDatos();
  }

  darDeBaja(est: Estudiante): void {
    this.estudianteSeleccionado.set(est);
    this.confirmarBaja.set(true);
  }

  ejecutarBaja(): void {
    const est = this.estudianteSeleccionado();
    if (!est) return;
    this.procesando.set(true);
    this.estudianteService.bajaLogica(est.estudianteId).subscribe({
      next: () => {
        this.procesando.set(false);
        this.confirmarBaja.set(false);
        this.cargarDatos();
      },
      error: () => {
        this.procesando.set(false);
        this.confirmarBaja.set(false);
      },
    });
  }
}
