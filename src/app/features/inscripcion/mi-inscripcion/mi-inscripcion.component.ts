import {
  ChangeDetectionStrategy, Component, inject, signal, OnInit
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { AuthStore } from '../../../core/store/auth.store';
import { InscripcionDetalle } from '../../../core/models/inscripcion.model';
import { SelectorMateriasComponent } from '../selector-materias/selector-materias.component';
import { CompanerosMateriaComponent } from '../companeros-materia/companeros-materia.component';

@Component({
  selector: 'app-mi-inscripcion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SelectorMateriasComponent, CompanerosMateriaComponent],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Mi inscripción</h1>

      @if (cargando()) {
        <div class="flex justify-center py-20" aria-busy="true" aria-label="Cargando">
          <div class="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (error()) {
        <div role="alert" class="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
          {{ error() }}
        </div>
      } @else if (!tieneExpediente()) {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div class="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-lg font-medium text-gray-900 mb-2">Sin expediente académico</h2>
          <p class="text-sm text-gray-500 mb-6">
            Tu cuenta aún no tiene un expediente académico vinculado.
            Regístrate para crear tu perfil de estudiante.
          </p>
          <a routerLink="/registro"
            class="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
            Ir a registro en línea
          </a>
        </div>
      } @else if (inscripcion().length === 0) {
        <app-selector-materias
          [estudianteId]="estudianteId()!"
          (inscripcionExitosa)="cargarInscripcion()" />
      } @else {
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 class="text-base font-medium text-gray-900 mb-4">Mis materias inscritas</h2>
          <div class="space-y-2">
            @for (item of inscripcion(); track item.materiaId) {
              <div class="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p class="font-medium text-sm text-gray-900">{{ item.nombreMateria }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ item.nombreProfesor }} · {{ item.creditos }} créditos</p>
                </div>
                <span class="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                  Inscrito
                </span>
              </div>
            }
          </div>
          <p class="text-xs text-gray-400 mt-4">
            Total: {{ inscripcion().length }} materias ·
            {{ totalCreditos() }} créditos
          </p>
        </div>

        <app-companeros-materia
          [estudianteId]="estudianteId()!"
          [inscripcion]="inscripcion()" />
      }
    </div>
  `
})
export class MiInscripcionComponent implements OnInit {
  private readonly inscripcionService = inject(InscripcionService);
  private readonly authStore = inject(AuthStore);

  tieneExpediente = this.authStore.tieneExpediente;
  estudianteId = this.authStore.estudianteId;
  inscripcion = signal<InscripcionDetalle[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  totalCreditos = () => this.inscripcion().reduce((acc, m) => acc + m.creditos, 0);

  ngOnInit(): void {
    this.cargarInscripcion();
  }

  cargarInscripcion(): void {
    const id = this.estudianteId();
    if (!id) {
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);
    this.inscripcionService.getInscripcion(id).subscribe({
      next: res => {
        this.inscripcion.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la inscripción');
        this.cargando.set(false);
      }
    });
  }
}
