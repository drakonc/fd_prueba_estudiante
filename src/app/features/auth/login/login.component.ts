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
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <h1 class="text-2xl font-medium mb-1 text-gray-900">Portal estudiantes</h1>
        <p class="text-gray-500 text-sm mb-6">Inicie sesión para continuar</p>

        @if (error()) {
          <div role="alert"
            class="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100">
            {{ error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <div class="mb-4">
            <label for="usuarioOEmail" class="block text-sm mb-1 text-gray-700 font-medium">
              Usuario o correo
            </label>
            <input
              id="usuarioOEmail"
              formControlName="usuarioOEmail"
              type="text"
              autocomplete="username"
              [attr.aria-invalid]="form.get('usuarioOEmail')?.invalid && form.get('usuarioOEmail')?.touched"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div class="mb-6">
            <label for="password" class="block text-sm mb-1 text-gray-700 font-medium">
              Contraseña
            </label>
            <input
              id="password"
              formControlName="password"
              type="password"
              autocomplete="current-password"
              [attr.aria-invalid]="form.get('password')?.invalid && form.get('password')?.touched"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <button
            type="submit"
            [disabled]="cargando()"
            class="w-full bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            {{ cargando() ? 'Ingresando...' : 'Entrar' }}
          </button>
        </form>

        <p class="text-sm text-center mt-4 text-gray-500">
          ¿Aún no está registrado?
          <a routerLink="/registro" class="text-emerald-600 hover:underline">Ir a registro</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  error = signal<string | null>(null);
  cargando = signal(false);

  form = new FormGroup({
    usuarioOEmail: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.error.set(null);

    this.authService.login(this.form.value as LoginRequest).subscribe({
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
          this.error.set(res.mensaje ?? 'Credenciales incorrectas');
        }
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 401 ? 'Credenciales incorrectas' : 'Error al conectar con el servidor');
        this.cargando.set(false);
      }
    });
  }
}
