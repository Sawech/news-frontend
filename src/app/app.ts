import { Component, inject, OnInit, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
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
    <div [style.padding-top.px]="isAdminRoute() ? 0 : headerOffset()">
      <router-outlet />
      @if (!isAdminRoute()) {
        <app-footer />
      }
    </div>
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
export class App implements OnInit, AfterViewInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);

  isAdminRoute = signal(false);
  headerOffset = signal(0);

  ngOnInit() {
    this.auth.restoreSession();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin'));
      });

    this.isAdminRoute.set(this.router.url.startsWith('/admin'));
  }

  ngAfterViewInit() {
    this.updateHeaderOffset();
  }

  @HostListener('window:resize')
  updateHeaderOffset() {
    // Measure the combined height of the fixed ticker + navbar
    const ticker = document.querySelector('.ticker') as HTMLElement;
    const navbar = document.querySelector('.navbar') as HTMLElement;
    const tickerH = ticker?.offsetHeight ?? 0;
    const navbarH = navbar?.offsetHeight ?? 0;

    // Also update the CSS variable used by navbar to sit below the ticker
    document.documentElement.style.setProperty('--ticker-height', `${tickerH}px`);

    this.headerOffset.set(tickerH + navbarH);
  }
}
