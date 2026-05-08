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
      <div class="h-screen bg-[#ECEEF8] flex overflow-hidden">
        <app-navbar />
        <main class="flex-1 overflow-y-auto min-w-0">
          <router-outlet />
        </main>
      </div>
    } @else {
      <main class="min-h-screen bg-[#ECEEF8]">
        <router-outlet />
      </main>
    }
  `
})
export class App {
  protected readonly authStore = inject(AuthStore);
}
