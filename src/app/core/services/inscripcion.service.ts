import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  InscripcionDetalle,
  CompaneroMateria,
  RegistrarInscripcionRequest
} from '../models/inscripcion.model';

@Injectable({ providedIn: 'root' })
export class InscripcionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Estudiantes`;

  getInscripcion(estudianteId: number): Observable<ApiResponse<InscripcionDetalle[]>> {
    return this.http.get<ApiResponse<InscripcionDetalle[]>>(
      `${this.base}/${estudianteId}/inscripcion`
    );
  }

  registrarInscripcion(
    estudianteId: number,
    body: RegistrarInscripcionRequest
  ): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.base}/${estudianteId}/inscripcion`, body
    );
  }

  getCompanerosPorMateria(
    estudianteId: number,
    materiaId: number
  ): Observable<ApiResponse<CompaneroMateria[]>> {
    return this.http.get<ApiResponse<CompaneroMateria[]>>(
      `${this.base}/${estudianteId}/materias/${materiaId}/companeros`
    );
  }
}
