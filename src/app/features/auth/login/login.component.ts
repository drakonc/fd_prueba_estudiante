import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/store/auth.store';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div
        class="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500 opacity-20"
      ></div>
      <div
        class="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-30"
      ></div>
      <div
        class="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-30"
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1
            class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Portal Estudiantes
          </h1>
          <p class="text-gray-500 text-sm mt-1">Inicie sesión para continuar</p>
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
            <label for="usuarioOEmail" class="block text-sm mb-1.5 text-gray-700 font-medium">
              Usuario o correo
            </label>
            <input
              id="usuarioOEmail"
              formControlName="usuarioOEmail"
              type="text"
              autocomplete="username"
              [attr.aria-invalid]="
                form.get('usuarioOEmail')?.invalid && form.get('usuarioOEmail')?.touched
              "
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
              autocomplete="current-password"
              [attr.aria-invalid]="form.get('password')?.invalid && form.get('password')?.touched"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            [disabled]="cargando()"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/25"
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
                Ingresando…
              </span>
            } @else {
              Entrar
            }
          </button>
        </form>

        <p class="text-sm text-center mt-6 text-gray-500">
          ¿Aún no está registrado?
          <a
            routerLink="/registro"
            class="text-blue-600 hover:text-indigo-600 font-medium transition-colors"
            >Ir a registro</a
          >
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  error = signal<string | null>(null);
  cargando = signal(false);

  form = new FormGroup({
    usuarioOEmail: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set(null);

    this.authService.login(this.form.value as LoginRequest).subscribe({
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
          this.error.set(res.mensaje ?? 'Credenciales incorrectas');
        }
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err.status === 401 ? 'Credenciales incorrectas' : 'Error al conectar con el servidor',
        );
        this.cargando.set(false);
      },
    });
  }
}
