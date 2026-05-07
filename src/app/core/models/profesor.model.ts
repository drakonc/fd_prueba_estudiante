export interface Profesor {
  profesorId: number;
  nombre: string;
  estado: boolean;
}

export interface CrearProfesorRequest {
  nombre: string;
}
