import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-6 py-10">
      <h1 class="text-3xl font-semibold text-gray-900 mb-2">
        Bienvenido, {{ authStore.sesion()?.nombreUsuario }}
      </h1>
      <p class="text-gray-500 mb-8">
        @if (authStore.esAdmin()) {
          Tiene acceso de administrador al portal académico.
        } @else {
          Acceda a sus opciones académicas desde el menú.
        }
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @if (authStore.tieneExpediente()) {
          <a routerLink="/mi-inscripcion"
            class="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 class="font-medium text-gray-900 mb-1">Mi inscripción</h2>
            <p class="text-sm text-gray-500">Ver y gestionar mis materias inscritas</p>
          </a>
        }

        <a routerLink="/estudiantes"
          class="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 class="font-medium text-gray-900 mb-1">Estudiantes</h2>
          <p class="text-sm text-gray-500">Consultar el directorio de estudiantes</p>
        </a>

        @if (authStore.esAdmin()) {
          <a routerLink="/materias"
            class="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 class="font-medium text-gray-900 mb-1">Materias</h2>
            <p class="text-sm text-gray-500">Administrar catálogo de materias</p>
          </a>

          <a routerLink="/profesores"
            class="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
              <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="font-medium text-gray-900 mb-1">Profesores</h2>
            <p class="text-sm text-gray-500">Administrar catálogo de profesores</p>
          </a>

          <a routerLink="/programas-credito"
            class="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
              <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 class="font-medium text-gray-900 mb-1">Programas de crédito</h2>
            <p class="text-sm text-gray-500">Administrar programas académicos</p>
          </a>

          <a routerLink="/usuarios"
            class="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3" aria-hidden="true">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 class="font-medium text-gray-900 mb-1">Usuarios</h2>
            <p class="text-sm text-gray-500">Administrar cuentas de usuario</p>
          </a>
        }
      </div>
    </div>
  `
})
export class InicioComponent {
  protected readonly authStore = inject(AuthStore);
}
