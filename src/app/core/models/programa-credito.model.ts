export interface ProgramaCredito {
  programaCreditoId: number;
  nombre: string;
  creditosPorMateria: number;
  maxMateriasPorEstudiante: number;
}

export interface CrearProgramaRequest {
  nombre: string;
  creditosPorMateria: number;
  maxMateriasPorEstudiante: number;
}
