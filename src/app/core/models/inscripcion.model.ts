export interface InscripcionDetalle {
  estudianteId: number;
  materiaId: number;
  nombreMateria: string;
  creditos: number;
  profesorId: number;
  nombreProfesor: string;
}

export interface CompaneroMateria {
  nombre: string;
}

export interface RegistrarInscripcionRequest {
  materiaId1: number;
  materiaId2: number;
  materiaId3: number;
}
