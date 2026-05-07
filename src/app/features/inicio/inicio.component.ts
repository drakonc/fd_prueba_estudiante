import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-6 py-10">
      <div class="mb-8">
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2"
        >
          Bienvenido, {{ authStore.sesion()?.nombreUsuario }}
        </h1>
        <p class="text-gray-500">
          @if (authStore.esAdmin()) {
            Tiene acceso de administrador al portal académico.
          } @else {
            Acceda a sus opciones académicas desde el menú.
          }
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        @if (authStore.esAdmin()) {
          <a
            routerLink="/estudiantes"
            class="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg shadow-gray-200/30 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-900 mb-1 text-lg">Estudiantes</h2>
            <p class="text-sm text-gray-500">Consultar el directorio de estudiantes</p>
          </a>
        }

        @if (authStore.tieneExpediente()) {
          <a
            routerLink="/mi-inscripcion"
            class="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg shadow-gray-200/30 p-6 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-900 mb-1 text-lg">Mi inscripción</h2>
            <p class="text-sm text-gray-500">Ver y gestionar mis materias inscritas</p>
          </a>
        }

        @if (authStore.esAdmin()) {
          <a
            routerLink="/materias"
            class="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg shadow-gray-200/30 p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-900 mb-1 text-lg">Materias</h2>
            <p class="text-sm text-gray-500">Administrar catálogo de materias</p>
          </a>

          <a
            routerLink="/profesores"
            class="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg shadow-gray-200/30 p-6 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-900 mb-1 text-lg">Profesores</h2>
            <p class="text-sm text-gray-500">Administrar catálogo de profesores</p>
          </a>

          <a
            routerLink="/programas-credito"
            class="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg shadow-gray-200/30 p-6 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-900 mb-1 text-lg">Programas de crédito</h2>
            <p class="text-sm text-gray-500">Administrar programas académicos</p>
          </a>

          <a
            routerLink="/usuarios"
            class="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg shadow-gray-200/30 p-6 hover:shadow-xl hover:shadow-gray-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div
              class="w-12 h-12 bg-gradient-to-br from-gray-600 to-slate-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
              aria-hidden="true"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-900 mb-1 text-lg">Usuarios</h2>
            <p class="text-sm text-gray-500">Administrar cuentas de usuario</p>
          </a>
        }
      </div>
    </div>
  `,
})
export class InicioComponent {
  protected readonly authStore = inject(AuthStore);
}
