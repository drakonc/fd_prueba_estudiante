export interface LoginRequest {
  usuarioOEmail: string;
  password: string;
}

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  usuarioId: number;
  nombreUsuario: string;
  email?: string;
  rol: 'Administrador' | 'Estudiante';
  estudianteId: number | null;
  tokens: LoginTokens;
}

export interface SesionUsuario {
  usuarioId: number;
  nombreUsuario: string;
  email?: string;
  rol: 'Administrador' | 'Estudiante';
  estudianteId: number | null;
}
