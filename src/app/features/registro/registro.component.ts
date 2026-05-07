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
    <div class="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500 opacity-20"
      ></div>
      <div
        class="absolute top-20 right-20 w-72 h-72 bg-indigo-400 rounded-full blur-3xl opacity-30"
      ></div>
      <div
        class="absolute bottom-20 left-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-30"
      ></div>

      <div
        class="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-md"
      >
        <div class="text-center mb-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          >
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1
            class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Crear cuenta
          </h1>
          <p class="text-gray-500 text-sm mt-1">Regístrese para acceder al portal</p>
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
            <label for="programaCreditoId" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Programa de crédito
            </label>
            @if (programas().length > 0) {
              <select
                id="programaCreditoId"
                formControlName="programaCreditoId"
                [attr.aria-invalid]="
                  form.get('programaCreditoId')?.invalid && form.get('programaCreditoId')?.touched
                "
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
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
                placeholder="Ingrese el ID del programa…"
                [attr.aria-invalid]="
                  form.get('programaCreditoId')?.invalid && form.get('programaCreditoId')?.touched
                "
                class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p class="text-xs text-gray-400 mt-1">
                Los programas no pudieron cargarse. Consulte con administración el ID de su
                programa.
              </p>
            }
          </div>

          <div>
            <label for="nombre" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Nombre completo
            </label>
            <input
              id="nombre"
              formControlName="nombre"
              type="text"
              autocomplete="name"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label for="nombreUsuario" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Nombre de usuario
            </label>
            <input
              id="nombreUsuario"
              formControlName="nombreUsuario"
              type="text"
              autocomplete="username"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label for="email" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Correo electrónico
            </label>
            <input
              id="email"
              formControlName="email"
              type="email"
              autocomplete="email"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label for="password" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Contraseña
            </label>
            <input
              id="password"
              formControlName="password"
              type="password"
              autocomplete="new-password"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            [disabled]="cargando()"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/25 mt-2"
          >
            @if (cargando()) {
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
                Creando cuenta…
              </span>
            } @else {
              Crear cuenta
            }
          </button>
        </form>

        <p class="text-sm text-center mt-6 text-gray-500">
          ¿Ya tiene cuenta?
          <a
            routerLink="/login"
            class="text-blue-600 hover:text-indigo-600 font-medium transition-colors"
            >Iniciar sesión</a
          >
        </p>
      </div>
    </div>
  `,
})
export class RegistroComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly programaService = inject(ProgramaCreditoService);
  private readonly router = inject(Router);

  programas = toSignal(
    this.programaService.getAll().pipe(
      map((r) => r.datos ?? []),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  error = signal<string | null>(null);
  cargando = signal(false);

  form = new FormGroup({
    programaCreditoId: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required]),
    nombreUsuario: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set(null);

    const body: RegistroRequest = {
      nombre: this.form.value.nombre!,
      email: this.form.value.email!,
      nombreUsuario: this.form.value.nombreUsuario!,
      password: this.form.value.password!,
      programaCreditoId: Number(this.form.value.programaCreditoId),
    };

    this.authService.registro(body).subscribe({
      next: (res) => {
        if (res.operacionExitosa && res.datos?.tokens) {
          this.authStore.guardarSesion(
            {
              usuarioId: res.datos.usuarioId,
              nombreUsuario: res.datos.nombreUsuario,
              email: res.datos.email,
              rol: res.datos.rol,
              estudianteId: res.datos.estudianteId,
            },
            res.datos.tokens.accessToken,
            res.datos.tokens.refreshToken,
          );
          this.router.navigate(['/inicio']);
        } else {
          this.error.set(res.mensaje ?? 'Error al crear la cuenta');
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al conectar con el servidor');
        this.cargando.set(false);
      },
    });
  }
}
