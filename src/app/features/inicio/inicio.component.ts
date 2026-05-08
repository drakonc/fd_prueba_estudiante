import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="px-8 py-8">
      <!-- Page header -->
      <div class="mb-8">
        <p class="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Portal Académico</p>
        <h1 class="text-2xl font-bold text-gray-800">
          Bienvenido, {{ authStore.sesion()?.nombreUsuario }}
        </h1>
        <p class="text-sm text-gray-400 mt-1">
          @if (authStore.esAdmin()) {
            Tiene acceso de administrador al portal académico.
          } @else {
            Acceda a sus opciones académicas desde el menú lateral.
          }
        </p>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        @if (authStore.tieneExpediente()) {
          <a
            routerLink="/mi-inscripcion"
            class="group bg-white rounded-2xl shadow-sm border border-white/60 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <div
              class="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-800 text-base mb-1">Mi inscripción</h2>
            <p class="text-sm text-gray-400">Ver y gestionar mis materias inscritas</p>
          </a>
        }

        @if (authStore.esAdmin()) {
          <a
            routerLink="/estudiantes"
            class="group bg-white rounded-2xl shadow-sm border border-white/60 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <div
              class="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-800 text-base mb-1">Estudiantes</h2>
            <p class="text-sm text-gray-400">Consultar el directorio de estudiantes</p>
          </a>

          <a
            routerLink="/materias"
            class="group bg-white rounded-2xl shadow-sm border border-white/60 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <div
              class="w-11 h-11 bg-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-800 text-base mb-1">Materias</h2>
            <p class="text-sm text-gray-400">Administrar catálogo de materias</p>
          </a>

          <a
            routerLink="/profesores"
            class="group bg-white rounded-2xl shadow-sm border border-white/60 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <div
              class="w-11 h-11 bg-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-800 text-base mb-1">Profesores</h2>
            <p class="text-sm text-gray-400">Administrar catálogo de profesores</p>
          </a>

          <a
            routerLink="/programas-credito"
            class="group bg-white rounded-2xl shadow-sm border border-white/60 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <div
              class="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 class="font-semibold text-gray-800 text-base mb-1">Programas de crédito</h2>
            <p class="text-sm text-gray-400">Administrar programas académicos</p>
          </a>

        }
      </div>
    </div>
  `,
})
export class InicioComponent {
  protected readonly authStore = inject(AuthStore);
}
