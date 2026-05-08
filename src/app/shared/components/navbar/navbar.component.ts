import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Sidebar -->
    <aside
      class="w-[88px] min-h-screen flex-shrink-0 flex flex-col py-4 px-2"
      aria-label="Navegación principal"
    >
      <div class="bg-white rounded-2xl flex flex-col items-center py-5 px-2 flex-1 shadow-sm">

        <!-- Brand logo -->
        <a
          routerLink="/inicio"
          class="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 hover:scale-105 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Portal Estudiantes — Ir al inicio"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </a>

        <!-- Nav items -->
        <nav class="flex flex-col items-center gap-1 w-full flex-1" role="navigation">

          <!-- Inicio (todos) -->
          <a
            routerLink="/inicio"
            routerLinkActive="!text-white !bg-blue-500 shadow-lg shadow-blue-500/30"
            [routerLinkActiveOptions]="{ exact: true }"
            class="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Inicio"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-[10px] font-medium leading-none">Inicio</span>
          </a>

          <!-- Mi Inscripción (estudiante con expediente) -->
          @if (!authStore.esAdmin() && authStore.tieneExpediente()) {
            <a
              routerLink="/mi-inscripcion"
              routerLinkActive="!text-white !bg-blue-500 shadow-lg shadow-blue-500/30"
              class="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Mi inscripción"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span class="text-[10px] font-medium leading-none">Inscripción</span>
            </a>
          }

          <!-- Admin items -->
          @if (authStore.esAdmin()) {
            <a
              routerLink="/estudiantes"
              routerLinkActive="!text-white !bg-blue-500 shadow-lg shadow-blue-500/30"
              class="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Estudiantes"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="text-[10px] font-medium leading-none">Estudiantes</span>
            </a>

            <a
              routerLink="/materias"
              routerLinkActive="!text-white !bg-blue-500 shadow-lg shadow-blue-500/30"
              class="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Materias"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span class="text-[10px] font-medium leading-none">Materias</span>
            </a>

            <a
              routerLink="/profesores"
              routerLinkActive="!text-white !bg-blue-500 shadow-lg shadow-blue-500/30"
              class="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Profesores"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="text-[10px] font-medium leading-none">Profesores</span>
            </a>

            <a
              routerLink="/programas-credito"
              routerLinkActive="!text-white !bg-blue-500 shadow-lg shadow-blue-500/30"
              class="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Programas de crédito"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span class="text-[10px] font-medium leading-none">Programas</span>
            </a>

          }
        </nav>

        <!-- Divider -->
        <div class="w-8 h-px bg-gray-100 my-3" aria-hidden="true"></div>

        <!-- User avatar + logout -->
        <div class="flex flex-col items-center gap-2">
          <div
            class="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold select-none"
            [attr.title]="authStore.sesion()?.nombreUsuario ?? ''"
          >
            {{ authStore.sesion()?.nombreUsuario?.charAt(0)?.toUpperCase() ?? '' }}
          </div>
          <button
            (click)="solicitarLogout()"
            class="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="Cerrar sesión"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Logout confirmation modal -->
    @if (confirmarSalida()) {
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-logout-titulo"
        style="overscroll-behavior: contain;"
      >
        <div class="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4">
          <div class="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 id="modal-logout-titulo" class="text-lg font-bold text-gray-900 text-center mb-2">Cerrar sesión</h2>
          <p class="text-sm text-gray-500 text-center mb-6">¿Está seguro que desea cerrar la sesión?</p>
          <div class="flex gap-3">
            <button
              (click)="confirmarSalida.set(false)"
              class="flex-1 px-4 py-2.5 text-sm text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
            >
              Cancelar
            </button>
            <button
              (click)="logout()"
              [disabled]="cerrando()"
              class="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors shadow-lg shadow-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              @if (cerrando()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
