export interface Estudiante {
  estudianteId: number;
  nombre: string;
  email: string;
  programaCreditoId: number;
  estado: boolean;
}

export interface CrearEstudianteRequest {
  nombre: string;
  email: string;
  programaCreditoId: number;
}
