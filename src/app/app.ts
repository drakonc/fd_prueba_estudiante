import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthStore } from './core/store/auth.store';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (authStore.estaAutenticado()) {
      <app-navbar />
    }
    <main class="min-h-screen bg-gray-50">
      <router-outlet />
    </main>
  `
})
export class App {
  protected readonly authStore = inject(AuthStore);
}
