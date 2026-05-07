import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav
      class="border-b border-gray-200/50 bg-white/80 backdrop-blur-md px-6 py-3 sticky top-0 z-40"
      aria-label="Navegación principal"
    >
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <a routerLink="/inicio" class="font-bold text-lg flex items-center gap-2 group">
          <div
            class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >Portal Estudiantes</span
          >
        </a>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
            <div
              class="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              {{ authStore.sesion()?.nombreUsuario?.charAt(0)?.toUpperCase() ?? '' }}
            </div>
            <span class="text-sm text-gray-600 font-medium">{{
              authStore.sesion()?.nombreUsuario
            }}</span>
          </div>
          <button
            (click)="solicitarLogout()"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
            aria-label="Cerrar sesión"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    @if (confirmarSalida()) {
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <h2 id="modal-titulo" class="text-lg font-bold text-gray-900 text-center mb-2">
            Cerrar sesión
          </h2>
          <p class="text-sm text-gray-500 text-center mb-6">
            ¿Está seguro que desea cerrar la sesión?
          </p>
          <div class="flex gap-3">
            <button
              (click)="confirmarSalida.set(false)"
              class="flex-1 px-4 py-2.5 text-sm text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="logout()"
              [disabled]="cerrando()"
              class="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors shadow-lg shadow-red-500/25"
            >
              @if (cerrando()) {
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
                  Cerrando…
                </span>
              } @else {
                Sí, cerrar sesión
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class NavbarComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  catalogoAbierto = signal(false);
  confirmarSalida = signal(false);
  cerrando = signal(false);

  solicitarLogout(): void {
    this.confirmarSalida.set(true);
  }

  logout(): void {
    this.cerrando.set(true);
    const refreshToken = sessionStorage.getItem('refreshToken') ?? '';
    this.authService.logout(refreshToken).subscribe({
      next: () => this._finalizarLogout(),
      error: () => this._finalizarLogout(),
    });
  }

  private _finalizarLogout(): void {
    this.authStore.limpiarSesion();
    this.cerrando.set(false);
    this.confirmarSalida.set(false);
    this.router.navigate(['/login']);
  }
}
