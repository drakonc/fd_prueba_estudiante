import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ProgramaCredito, CrearProgramaRequest } from '../models/programa-credito.model';

@Injectable({ providedIn: 'root' })
export class ProgramaCreditoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ProgramasCredito`;

  getAll(): Observable<ApiResponse<ProgramaCredito[]>> {
    return this.http.get<ApiResponse<ProgramaCredito[]>>(this.base);
  }

  crear(body: CrearProgramaRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.base, body);
  }

  actualizar(id: number, body: CrearProgramaRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.base}/${id}`, body);
  }

  eliminar(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.base}/${id}`);
  }
}
