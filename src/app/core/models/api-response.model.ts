export interface ApiResponse<T> {
  operacionExitosa: boolean;
  codigo?: number;
  mensaje?: string;
  datos?: T;
  errores?: string[];
}
