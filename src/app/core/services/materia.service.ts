import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Materia, CrearMateriaRequest } from '../models/materia.model';

@Injectable({ providedIn: 'root' })
export class MateriaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/Materias`;

  getAll(): Observable<ApiResponse<Materia[]>> {
    return this.http.get<ApiResponse<Materia[]>>(this.base);
  }

  crear(body: CrearMateriaRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.base, body);
  }

  actualizar(id: number, body: CrearMateriaRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${id}`, body);
  }

  eliminar(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
