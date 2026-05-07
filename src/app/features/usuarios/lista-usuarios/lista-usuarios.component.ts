import {
  ChangeDetectionStrategy, Component, inject, signal, OnInit
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-lista-usuarios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <p class="text-sm text-gray-500 mt-1">{{ usuarios().length }} registros</p>
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
            <table class="w-full text-sm" aria-label="Lista de usuarios">
              <thead>
                <tr class="border-b border-gray-100 text-left">
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Usuario</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Correo</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Rol</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Estado</th>
                  <th scope="col" class="px-4 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (u of usuarios(); track u.usuarioId) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 text-gray-900 font-medium">{{ u.nombreUsuario }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
                    <td class="px-4 py-3">
                      <span [class]="u.rol === 'Administrador'
                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'"
                        class="px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ u.rol }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span [class]="u.estado
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-red-50 text-red-700 border border-red-100'"
                        class="px-2 py-0.5 rounded-full text-xs font-medium">
                        {{ u.estado ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2">
                        <button (click)="abrirEdicion(u)"
                          class="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          [attr.aria-label]="'Editar rol de ' + u.nombreUsuario">Editar rol</button>
                        @if (u.estado) {
                          <button (click)="confirmarBaja(u)"
                            class="text-sm text-red-600 hover:text-red-700 transition-colors"
                            [attr.aria-label]="'Dar de baja a ' + u.nombreUsuario">Dar de baja</button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-4 py-12 text-center text-gray-400">No se encontraron usuarios</td>
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
        role="dialog" aria-modal="true" aria-labelledby="form-usr-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h2 id="form-usr-titulo" class="text-lg font-medium mb-1">Cambiar rol</h2>
          <p class="text-sm text-gray-500 mb-4">Usuario: <strong>{{ seleccionado()?.nombreUsuario }}</strong></p>

          @if (errorForm()) {
            <div role="alert" class="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100">
              {{ errorForm() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="guardar()" novalidate class="space-y-4">
            <div>
              <label for="usr-rol" class="block text-sm mb-1 text-gray-700 font-medium">Rol</label>
              <select id="usr-rol" formControlName="rol"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="Estudiante">Estudiante</option>
                <option value="Administrador">Administrador</option>
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

    @if (mostrarConfirmBaja()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        role="dialog" aria-modal="true" aria-labelledby="baja-usr-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
          <h2 id="baja-usr-titulo" class="text-lg font-medium mb-2">Dar de baja</h2>
          <p class="text-sm text-gray-500 mb-6">
            ¿Confirma dar de baja al usuario <strong>{{ seleccionado()?.nombreUsuario }}</strong>?
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
    rol: new FormControl('Estudiante', [Validators.required])
  });

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.cargando.set(true);
    this.usuarioService.getAll().subscribe({
      next: res => { this.usuarios.set(res.datos ?? []); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar los usuarios'); this.cargando.set(false); }
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
      next: res => {
        if (res.operacionExitosa) { this.cerrarForm(); this.cargarDatos(); }
        else { this.errorForm.set(res.mensaje ?? 'Error al guardar'); }
        this.guardando.set(false);
      },
      error: () => { this.errorForm.set('Error al conectar con el servidor'); this.guardando.set(false); }
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
      next: () => { this.procesando.set(false); this.mostrarConfirmBaja.set(false); this.cargarDatos(); },
      error: () => { this.procesando.set(false); this.mostrarConfirmBaja.set(false); }
    });
  }
}
