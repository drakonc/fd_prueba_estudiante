import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';
import { inscripcionGuard } from './core/guards/inscripcion.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'estudiantes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/estudiantes/lista-estudiantes/lista-estudiantes.component')
        .then(m => m.ListaEstudiantesComponent)
  },
  {
    path: 'mi-inscripcion',
    canActivate: [inscripcionGuard],
    loadComponent: () =>
      import('./features/inscripcion/mi-inscripcion/mi-inscripcion.component')
        .then(m => m.MiInscripcionComponent)
  },
  {
    path: 'materias',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/materias/lista-materias/lista-materias.component')
        .then(m => m.ListaMateriasComponent)
  },
  {
    path: 'profesores',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/profesores/lista-profesores/lista-profesores.component')
        .then(m => m.ListaProfesoresComponent)
  },
  {
    path: 'programas-credito',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/programas-credito/lista-programas/lista-programas.component')
        .then(m => m.ListaProgramasComponent)
  },
  { path: '**', redirectTo: '/inicio' }
];
