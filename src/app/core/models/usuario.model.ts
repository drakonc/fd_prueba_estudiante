export interface Usuario {
  usuarioId: number;
  nombreUsuario: string;
  email: string;
  rol: 'Administrador' | 'Estudiante';
  estado: boolean;
  estudianteId: number | null;
}
