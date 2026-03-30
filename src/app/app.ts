import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthService } from './core/services/auth.service';
import { signal } from '@angular/core';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    @if (!isAdminRoute()) {
      <app-navbar />
    }
    <router-outlet />
    @if (!isAdminRoute()) {
      <app-footer />
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
    `,
  ],
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  isAdminRoute = signal(false);

  ngOnInit() {
    this.auth.restoreSession();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin'));
      });

    this.isAdminRoute.set(this.router.url.startsWith('/admin'));
  }
}
