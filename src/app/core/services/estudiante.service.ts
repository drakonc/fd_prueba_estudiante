import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Estudiante, CrearEstudianteRequest } from '../models/estudiante.model';
import { Materia } from '../models/materia.model';

@Injectable({ providedIn: 'root' })
export class EstudianteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Estudiantes`;

  getAll(): Observable<ApiResponse<Estudiante[]>> {
    return this.http.get<ApiResponse<Estudiante[]>>(this.base);
  }

  getCatalogoMaterias(): Observable<ApiResponse<Materia[]>> {
    return this.http.get<ApiResponse<Materia[]>>(`${this.base}/catalogo/materias`);
  }

  crear(body: CrearEstudianteRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.base, body);
  }

  actualizar(id: number, body: CrearEstudianteRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${id}`, body);
  }

  bajaLogica(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
