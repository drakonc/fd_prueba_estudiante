import { Injectable, signal, computed } from '@angular/core';
import { SesionUsuario } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _sesion = signal<SesionUsuario | null>(this._cargarSesion());
  private readonly _accessToken = signal<string | null>(
    localStorage.getItem('accessToken')
  );

  readonly sesion = this._sesion.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly estaAutenticado = computed(() => this._sesion() !== null);
  readonly esAdmin = computed(() => this._sesion()?.rol === 'Administrador');
  readonly estudianteId = computed(() => this._sesion()?.estudianteId ?? null);
  readonly tieneExpediente = computed(() => this._sesion()?.estudianteId != null);

  guardarSesion(sesion: SesionUsuario, accessToken: string, refreshToken: string): void {
    this._sesion.set(sesion);
    this._accessToken.set(accessToken);
    localStorage.setItem('sesion', JSON.stringify(sesion));
    localStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  actualizarTokens(accessToken: string, refreshToken: string): void {
    this._accessToken.set(accessToken);
    localStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  limpiarSesion(): void {
    this._sesion.set(null);
    this._accessToken.set(null);
    localStorage.removeItem('sesion');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  }

  private _cargarSesion(): SesionUsuario | null {
    try {
      const json = localStorage.getItem('sesion');
      return json ? (JSON.parse(json) as SesionUsuario) : null;
    } catch {
      return null;
    }
  }
}
