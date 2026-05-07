import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { EstudianteService } from '../../../core/services/estudiante.service';
import { InscripcionService } from '../../../core/services/inscripcion.service';
import { Materia } from '../../../core/models/materia.model';

type EstadoMateria = 'seleccionada' | 'bloqueada' | 'disponible';

@Component({
  selector: 'app-selector-materias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-medium text-gray-900">
          Agregar materias ({{ slotsDisponibles() }} slot{{ slotsDisponibles() === 1 ? '' : 's' }} disponible{{ slotsDisponibles() === 1 ? '' : 's' }})
        </h2>
        <span class="text-sm text-gray-500">
          <strong
            [class]="seleccionadas().size >= 1 ? 'text-emerald-600' : 'text-gray-700'"
          >
            {{ seleccionadas().size }}
          </strong>/{{ slotsDisponibles() }} a seleccionar
        </span>
      </div>

      @if (error()) {
        <div
          role="alert"
          class="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4 border border-red-100"
        >
          {{ error() }}
        </div>
      }

      @if (exito()) {
        <div
          role="status"
          class="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4 border border-emerald-100"
        >
          {{ exito() }}
        </div>
      }

      @if (cargando()) {
        <div class="flex justify-center py-8" aria-busy="true" aria-label="Cargando materias">
          <div
            class="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
      } @else if (materiasDisponibles().length === 0) {
        <p class="text-sm text-gray-500 text-center py-6">
          No hay más materias disponibles para agregar.
        </p>
      } @else {
        <div class="space-y-2" role="group" aria-label="Lista de materias disponibles">
          @for (materia of materiasDisponibles(); track materia.materiaId) {
            @let estado = estadoMateria()(materia);
            <div
              (click)="toggleMateria(materia.materiaId)"
              (keydown.enter)="toggleMateria(materia.materiaId)"
              (keydown.space)="toggleMateria(materia.materiaId)"
              [tabindex]="estado === 'bloqueada' ? -1 : 0"
              role="checkbox"
              [attr.aria-checked]="estado === 'seleccionada'"
              [attr.aria-disabled]="estado === 'bloqueada'"
              [attr.aria-label]="materia.nombre + ' - ' + materia.nombreProfesor"
              [class]="
                estado === 'seleccionada'
                  ? 'border-emerald-500 bg-emerald-50 cursor-pointer'
                  : estado === 'bloqueada'
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-emerald-300 cursor-pointer'
              "
              class="border rounded-lg px-4 py-3 flex items-center justify-between transition-all"
            >
              <div>
                <p class="font-medium text-sm text-gray-900">{{ materia.nombre }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ materia.nombreProfesor }} · {{ materia.creditos }} créditos
                </p>
              </div>
              <div class="flex items-center gap-2">
                @if (estado === 'bloqueada' && !seleccionadas().has(materia.materiaId)) {
                  <span class="text-xs text-red-500">Mismo profesor</span>
                }
                @if (estado === 'seleccionada') {
                  <svg
                    class="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
              </div>
            </div>
          }
        </div>

        <button
          (click)="confirmarInscripcion()"
          [disabled]="!puedeConfirmar() || enviando()"
          class="mt-6 w-full bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-medium
            hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {{ enviando() ? 'Registrando...' : 'Confirmar inscripción' }}
        </button>
      }
    </div>
  `,
})
export class SelectorMateriasComponent implements OnInit {
  private readonly estudianteService = inject(EstudianteService);
  private readonly inscripcionService = inject(InscripcionService);

  estudianteId = input.required<number>();
  inscritosIds = input<number[]>([]);
  inscripcionExitosa = output<void>();

  materias = signal<Materia[]>([]);
  seleccionadas = signal<Set<number>>(new Set());
  cargando = signal(true);
  enviando = signal(false);
  error = signal<string | null>(null);
  exito = signal<string | null>(null);

  /** Cuántos slots quedan libres (3 totales menos los ya inscritos) */
  slotsDisponibles = computed(() => 3 - this.inscritosIds().length);

  /** Catálogo sin las materias ya inscritas */
  materiasDisponibles = computed(() =>
    this.materias().filter((m) => !this.inscritosIds().includes(m.materiaId)),
  );

  profesoresYaInscritos = computed(() => {
    const inscritos = this.inscritosIds();
    return new Set(
      this.materias()
        .filter((m) => inscritos.includes(m.materiaId))
        .map((m) => m.profesorId),
    );
  });

  profesoresSeleccionados = computed(() => {
    const ids = [...this.seleccionadas()];
    return new Set(
      this.materias()
        .filter((m) => ids.includes(m.materiaId))
        .map((m) => m.profesorId),
    );
  });

  estadoMateria = computed(() => {
    const sel = this.seleccionadas();
    const profsBloqueados = new Set([
      ...this.profesoresSeleccionados(),
      ...this.profesoresYaInscritos(),
    ]);
    const slots = this.slotsDisponibles();
    return (m: Materia): EstadoMateria => {
      if (sel.has(m.materiaId)) return 'seleccionada';
      if (profsBloqueados.has(m.profesorId)) return 'bloqueada';
      if (sel.size >= slots) return 'bloqueada';
      return 'disponible';
    };
  });

  puedeConfirmar = computed(
    () => this.seleccionadas().size >= 1 && this.seleccionadas().size <= this.slotsDisponibles(),
  );

  ngOnInit(): void {
    this.estudianteService.getCatalogoMaterias().subscribe({
      next: (res) => {
        this.materias.set(res.datos ?? []);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  toggleMateria(materiaId: number): void {
    const materia = this.materias().find((m) => m.materiaId === materiaId);
    if (!materia) return;
    if (this.estadoMateria()(materia) === 'bloqueada') return;

    const nuevas = new Set(this.seleccionadas());
    if (nuevas.has(materiaId)) {
      nuevas.delete(materiaId);
    } else {
      nuevas.add(materiaId);
    }
    this.seleccionadas.set(nuevas);
  }

  confirmarInscripcion(): void {
    if (!this.puedeConfirmar()) return;
    // Combinar los ya inscritos con los recién seleccionados
    const todas = [...this.inscritosIds(), ...this.seleccionadas()];
    this.enviando.set(true);
    this.error.set(null);

    const body: any = {
      materiaId1: todas[0] ?? null,
      materiaId2: todas[1] ?? null,
      materiaId3: todas[2] ?? null,
    };

    this.inscripcionService.registrarInscripcion(this.estudianteId(), body).subscribe({
      next: (res) => {
        if (res.operacionExitosa) {
          this.exito.set('¡Materia(s) agregada(s) exitosamente!');
          this.seleccionadas.set(new Set());
          this.inscripcionExitosa.emit();
        } else {
          this.error.set(res.mensaje ?? 'Error al registrar la inscripción');
        }
        this.enviando.set(false);
      },
      error: () => {
        this.error.set('Error al conectar con el servidor');
        this.enviando.set(false);
      },
    });
  }
}
