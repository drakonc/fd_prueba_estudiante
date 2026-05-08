import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-lista-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="px-8 py-8">
      <div class="mb-6">
        <p class="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Administración</p>
        <h1 class="text-2xl font-bold text-gray-800">Usuarios</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ usuarios().length }} registros</p>
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
            <table class="w-full text-sm" aria-label="Lista de usuarios">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/50 text-left">
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Usuario</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Correo</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Rol</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Estado</th>
                  <th scope="col" class="px-5 py-4 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (u of usuarios(); track u.usuarioId) {
                  <tr
                    class="border-b border-gray-50/50 hover:bg-blue-50/30 transition-colors duration-200"
                  >
                    <td class="px-5 py-4 text-gray-900 font-medium">{{ u.nombreUsuario }}</td>
                    <td class="px-5 py-4 text-gray-600">{{ u.email }}</td>
                    <td class="px-5 py-4">
                      <span
                        [class]="
                          u.rol === 'Administrador'
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        "
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {{ u.rol }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <span
                        [class]="
                          u.estado
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        "
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {{ u.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex gap-2">
                        <button
                          (click)="abrirEdicion(u)"
                          class="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          [attr.aria-label]="'Editar rol de ' + u.nombreUsuario"
                        >
                          Editar rol
                        </button>
                        @if (u.estado) {
                          <button
                            (click)="confirmarBaja(u)"
                            class="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            [attr.aria-label]="'Dar de baja a ' + u.nombreUsuario"
                          >
                            Dar de baja
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-5 py-16 text-center text-gray-400">
                      No se encontraron usuarios
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
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-usr-titulo"
        style="overscroll-behavior: contain;"
      >
        <div
          class="bg-white rounded-3xl shadow-2xl border border-white/50 p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200"
        >
          <div class="flex items-center gap-3 mb-5">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h2 id="form-usr-titulo" class="text-lg font-bold text-gray-900">Cambiar rol</h2>
          </div>
          <p class="text-sm text-gray-500 mb-4">
            Usuario: <strong class="text-gray-700">{{ seleccionado()?.nombreUsuario }}</strong>
          </p>

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
              <label for="usr-rol" class="block text-sm mb-1.5 text-gray-700 font-medium"
                >Rol</label
              >
              <select
                id="usr-rol"
                formControlName="rol"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="Estudiante">Estudiante</option>
                <option value="Administrador">Administrador</option>
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

    @if (mostrarConfirmBaja()) {
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="baja-usr-titulo"
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
          <h2 id="baja-usr-titulo" class="text-lg font-bold text-gray-900 text-center mb-2">
            Dar de baja
          </h2>
          <p class="text-sm text-gray-500 text-center mb-6">
            ¿Confirma dar de baja al usuario
            <strong class="text-gray-700">{{ seleccionado()?.nombreUsuario }}</strong
            >?
          </p>
          <div class="flex gap-3">
            <button
              (click)="mostrarConfirmBaja.set(false)"
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
export class ListaUsuariosComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  mostrarForm = signal(false);
  mostrarConfirmBaja = signal(false);
  procesando = signal(false);
  guardando = signal(false);
  errorForm = signal<string | null>(null);
  seleccionado = signal<Usuario | null>(null);

  form = new FormGroup({
    rol: new FormControl('Estudiante', [Validators.required]),
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    this.usuarioService.getAll().subscribe({
      next: (res) => {
        this.usuarios.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los usuarios');
        this.cargando.set(false);
      },
    });
  }

  abrirEdicion(u: Usuario): void {
    this.seleccionado.set(u);
    this.form.patchValue({ rol: u.rol });
    this.errorForm.set(null);
    this.mostrarForm.set(true);
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
    this.seleccionado.set(null);
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    this.errorForm.set(null);

    const u = this.seleccionado();
    if (!u) return;

    this.usuarioService.actualizarRol(u.usuarioId, { rol: this.form.value.rol! }).subscribe({
      next: (res) => {
        if (res.operacionExitosa) {
          this.cerrarForm();
          this.cargarDatos();
        } else {
          this.errorForm.set(res.mensaje ?? 'Error al guardar');
        }
        this.guardando.set(false);
      },
      error: () => {
        this.errorForm.set('Error al conectar con el servidor');
        this.guardando.set(false);
      },
    });
  }

  confirmarBaja(u: Usuario): void {
    this.seleccionado.set(u);
    this.mostrarConfirmBaja.set(true);
  }

  ejecutarBaja(): void {
    const u = this.seleccionado();
    if (!u) return;
    this.procesando.set(true);
    this.usuarioService.bajaLogica(u.usuarioId).subscribe({
      next: () => {
        this.procesando.set(false);
        this.mostrarConfirmBaja.set(false);
        this.cargarDatos();
      },
      error: () => {
        this.procesando.set(false);
        this.mostrarConfirmBaja.set(false);
      },
    });
  }
}
