export interface Materia {
  materiaId: number;
  nombre: string;
  creditos: number;
  profesorId: number;
  nombreProfesor: string;
  programaCreditoId: number;
}

export interface CrearMateriaRequest {
  nombre: string;
  creditos: number;
  profesorId: number;
  programaCreditoId: number;
}
