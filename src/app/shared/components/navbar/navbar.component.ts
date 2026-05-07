import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="border-b border-gray-100 bg-white px-6 py-3" aria-label="Navegación principal">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <a routerLink="/inicio" class="font-semibold text-emerald-600 text-lg">
          Portal Estudiantes
        </a>

        <div class="flex items-center gap-6 text-sm">
          <a routerLink="/inicio" routerLinkActive="text-emerald-600 font-medium"
            class="text-gray-600 hover:text-emerald-600 transition-colors">
            Inicio
          </a>

          @if (authStore.tieneExpediente()) {
            <a routerLink="/mi-inscripcion" routerLinkActive="text-emerald-600 font-medium"
              class="text-gray-600 hover:text-emerald-600 transition-colors">
              Mi inscripción
            </a>
          }

        </div>

        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">{{ authStore.sesion()?.nombreUsuario }}</span>
          <button
            (click)="solicitarLogout()"
            class="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
            aria-label="Cerrar sesión">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salir
          </button>
        </div>
      </div>
    </nav>

    @if (confirmarSalida()) {
      <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <div class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-4">
          <h2 id="modal-titulo" class="text-lg font-medium mb-2">Cerrar sesión</h2>
          <p class="text-sm text-gray-500 mb-6">¿Está seguro que desea cerrar la sesión?</p>
          <div class="flex gap-3 justify-end">
            <button
              (click)="confirmarSalida.set(false)"
              class="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              (click)="logout()"
              [disabled]="cerrando()"
              class="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
              {{ cerrando() ? 'Cerrando...' : 'Sí, cerrar sesión' }}
            </button>
          </div>
        </div>
      </div>
    }
  `
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
      error: () => this._finalizarLogout()
    });
  }

  private _finalizarLogout(): void {
    this.authStore.limpiarSesion();
    this.cerrando.set(false);
    this.confirmarSalida.set(false);
    this.router.navigate(['/login']);
  }
}
