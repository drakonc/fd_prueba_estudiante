import {
  ChangeDetectionStrategy, Component, inject, input, signal, OnInit, effect
} from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { InscripcionDetalle } from '../../../core/models/inscripcion.model';

interface GrupoCompaneros {
  materiaId: number;
  materiaNombre: string;
  companeros: string[];
}

@Component({
  selector: 'app-companeros-materia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cargando()) {
      <div class="flex justify-center py-8" aria-busy="true" aria-label="Cargando compañeros">
        <div class="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    } @else if (grupos().length === 0) {
      <p class="text-gray-400 text-sm text-center py-6">No hay compañeros registrados aún.</p>
    } @else {
      <div class="space-y-4">
        @for (grupo of grupos(); track grupo.materiaId) {
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {{ grupo.materiaNombre }}
            </p>
            @if (grupo.companeros.length === 0) {
              <p class="text-xs text-gray-400 pl-1">Sin compañeros inscritos aún.</p>
            } @else {
              <ul class="space-y-1.5" [attr.aria-label]="'Compañeros de ' + grupo.materiaNombre">
                @for (nombre of grupo.companeros; track nombre) {
                  <li class="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <span
                      class="w-7 h-7 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      aria-hidden="true">
                      {{ nombre.charAt(0).toUpperCase() }}
                    </span>
                    <span class="text-sm text-gray-700 truncate">{{ nombre }}</span>
                  </li>
                }
              </ul>
            }
          </div>
          <hr class="border-gray-50 last:hidden" />
        }
      </div>
    }
  `
})
export class CompanerosMateriaComponent implements OnInit {
  private readonly inscripcionService = inject(InscripcionService);

  estudianteId = input.required<number>();
  inscripcion = input<InscripcionDetalle[]>([]);

  grupos = signal<GrupoCompaneros[]>([]);
  cargando = signal(true);

  constructor() {
    effect(() => {
      const materias = this.inscripcion();
      if (materias.length > 0) {
        this.cargarTodosLosCompaneros(this.estudianteId(), materias);
      }
    });
  }

  ngOnInit(): void {
    const materias = this.inscripcion();
    if (materias.length > 0) {
      this.cargarTodosLosCompaneros(this.estudianteId(), materias);
    } else {
      this.cargando.set(false);
    }
  }

  private cargarTodosLosCompaneros(estudianteId: number, materias: InscripcionDetalle[]): void {
    this.cargando.set(true);

    const peticiones = materias.map(m =>
      this.inscripcionService.getCompanerosPorMateria(estudianteId, m.materiaId).pipe(
        catchError(() => of({ operacionExitosa: true, datos: [] as { nombre: string }[] }))
      )
    );

    forkJoin(peticiones).subscribe(resultados => {
      const gruposNuevos: GrupoCompaneros[] = materias.map((materia, i) => ({
        materiaId: materia.materiaId,
        materiaNombre: materia.nombreMateria,
        companeros: (resultados[i].datos ?? []).map((c: { nombre: string }) => c.nombre)
      }));
      this.grupos.set(gruposNuevos);
      this.cargando.set(false);
    });
  }
}
