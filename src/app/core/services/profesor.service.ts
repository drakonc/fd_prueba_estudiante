import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Profesor, CrearProfesorRequest } from '../models/profesor.model';

@Injectable({ providedIn: 'root' })
export class ProfesorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Profesores`;

  getAll(): Observable<ApiResponse<Profesor[]>> {
    return this.http.get<ApiResponse<Profesor[]>>(this.base);
  }

  crear(body: CrearProfesorRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.base, body);
  }

  actualizar(id: number, body: CrearProfesorRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${id}`, body);
  }

  bajaLogica(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
