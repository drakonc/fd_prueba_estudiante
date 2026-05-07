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
    <div class="mt-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Compañeros de clase</h2>

      @if (cargando()) {
        <div class="flex justify-center py-8" aria-busy="true" aria-label="Cargando compañeros">
          <div class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else if (grupos().length === 0) {
        <p class="text-gray-400 text-sm">No hay compañeros registrados aún.</p>
      } @else {
        <div class="space-y-4">
          @for (grupo of grupos(); track grupo.materiaId) {
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 class="font-medium text-gray-800 mb-2 text-sm">{{ grupo.materiaNombre }}</h3>
              @if (grupo.companeros.length === 0) {
                <p class="text-gray-400 text-sm">Sin compañeros inscritos.</p>
              } @else {
                <ul class="space-y-1" [attr.aria-label]="'Compañeros de ' + grupo.materiaNombre">
                  @for (nombre of grupo.companeros; track nombre) {
                    <li class="text-sm text-gray-600 flex items-center gap-2">
                      <span
                        class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-500"
                        aria-hidden="true">
                        {{ nombre.charAt(0).toUpperCase() }}
                      </span>
                      {{ nombre }}
                    </li>
                  }
                </ul>
              }
            </div>
          }
        </div>
      }
    </div>
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
