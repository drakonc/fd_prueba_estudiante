import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/store/auth.store';
import { ProgramaCreditoService } from '../../core/services/programa-credito.service';
import { RegistroRequest } from '../../core/models/registro.model';

@Component({
  selector: 'app-registro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 class="text-2xl font-medium mb-1 text-gray-900">Crear cuenta</h1>
        <p class="text-gray-500 text-sm mb-6">Regístrese para acceder al portal</p>

        @if (error()) {
          <div role="alert"
            class="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100">
            {{ error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="space-y-4">
          <div>
            <label for="programaCreditoId" class="block text-sm mb-1 text-gray-700 font-medium">
              Programa de crédito
            </label>
            @if (programas().length > 0) {
              <select
                id="programaCreditoId"
                formControlName="programaCreditoId"
                [attr.aria-invalid]="form.get('programaCreditoId')?.invalid && form.get('programaCreditoId')?.touched"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="">Seleccione un programa</option>
                @for (p of programas(); track p.programaCreditoId) {
                  <option [value]="p.programaCreditoId">{{ p.nombre }}</option>
                }
              </select>
            } @else {
              <input
                id="programaCreditoId"
                formControlName="programaCreditoId"
                type="number"
                min="1"
                placeholder="Ingrese el ID del programa"
                [attr.aria-invalid]="form.get('programaCreditoId')?.invalid && form.get('programaCreditoId')?.touched"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <p class="text-xs text-gray-400 mt-1">
                Los programas no pudieron cargarse. Consulte con administración el ID de su programa.
              </p>
            }
          </div>

          <div>
            <label for="nombre" class="block text-sm mb-1 text-gray-700 font-medium">
              Nombre completo
            </label>
            <input id="nombre" formControlName="nombre" type="text" autocomplete="name"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label for="nombreUsuario" class="block text-sm mb-1 text-gray-700 font-medium">
              Nombre de usuario
            </label>
            <input id="nombreUsuario" formControlName="nombreUsuario" type="text" autocomplete="username"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label for="email" class="block text-sm mb-1 text-gray-700 font-medium">
              Correo electrónico
            </label>
            <input id="email" formControlName="email" type="email" autocomplete="email"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label for="password" class="block text-sm mb-1 text-gray-700 font-medium">
              Contraseña
            </label>
            <input id="password" formControlName="password" type="password" autocomplete="new-password"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <button type="submit" [disabled]="cargando()"
            class="w-full bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors mt-2">
            {{ cargando() ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="text-sm text-center mt-4 text-gray-500">
          ¿Ya tiene cuenta?
          <a routerLink="/login" class="text-emerald-600 hover:underline">Iniciar sesión</a>
        </p>
      </div>
    </div>
  `
})
export class RegistroComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly programaService = inject(ProgramaCreditoService);
  private readonly router = inject(Router);

  programas = toSignal(
    this.programaService.getAll().pipe(
      map(r => r.datos ?? []),
      catchError(() => of([]))
    ),
    { initialValue: [] }
  );

  error = signal<string | null>(null);
  cargando = signal(false);

  form = new FormGroup({
    programaCreditoId: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    nombreUsuario: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando.set(true);
    this.error.set(null);

    const body: RegistroRequest = {
      nombre: this.form.value.nombre!,
      email: this.form.value.email!,
      nombreUsuario: this.form.value.nombreUsuario!,
      password: this.form.value.password!,
      programaCreditoId: Number(this.form.value.programaCreditoId)
    };

    this.authService.registro(body).subscribe({
      next: res => {
        if (res.operacionExitosa && res.datos?.tokens) {
          this.authStore.guardarSesion(
            {
              usuarioId: res.datos.usuarioId,
              nombreUsuario: res.datos.nombreUsuario,
              email: res.datos.email,
              rol: res.datos.rol,
              estudianteId: res.datos.estudianteId
            },
            res.datos.tokens.accessToken,
            res.datos.tokens.refreshToken
          );
          this.router.navigate(['/inicio']);
        } else {
          this.error.set(res.mensaje ?? 'Error al crear la cuenta');
        }
        this.cargando.set(false);
      },
      error: () => { this.error.set('Error al conectar con el servidor'); this.cargando.set(false); }
    });
  }
}
