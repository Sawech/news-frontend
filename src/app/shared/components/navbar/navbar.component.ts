import { Component, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminTicker } from '../../../core/models/admin.model';
import { AdminApiService } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <!-- Breaking News Ticker -->
    <div class="ticker">
      <div class="container ticker__inner">
        <span class="ticker__label">Breaking</span>
        <div class="ticker__viewport">
          <div class="ticker__track">
            @for (ticker of tickers(); track ticker.id) {
              <span class="ticker__text"> {{ ticker.content }}</span>
              <span class="ticker__text">|</span>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="navbar" [class.navbar--scrolled]="scrolled()">
      <div class="container navbar__inner">
        <div class="navbar__left">
          <a routerLink="/" class="navbar__logo">THE CHRONICLER</a>
          <nav class="navbar__nav">
            @for (cat of navCategories; track cat.slug) {
              <a
                [routerLink]="['/category', cat.slug]"
                routerLinkActive="navbar__link--active"
                class="navbar__link"
                >{{ cat.label }}</a
              >
            }
          </nav>
        </div>

        <div class="navbar__right">
          <!-- Search toggle -->
          <button class="navbar__icon-btn" (click)="toggleSearch()" aria-label="Search">
            <span class="material-symbols-outlined">{{ searchOpen() ? 'close' : 'search' }}</span>
          </button>
          <!-- Mobile menu -->
          <button
            class="navbar__icon-btn navbar__menu-btn"
            (click)="toggleMenu()"
            aria-label="Menu"
          >
            <span class="material-symbols-outlined">{{ menuOpen() ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>

      <!-- Search overlay -->
      @if (searchOpen()) {
        <div class="navbar__search-bar container">
          <input
            #searchInput
            class="navbar__search-input"
            type="text"
            placeholder="Search articles, topics, authors…"
            [(ngModel)]="searchQuery"
            (keydown.enter)="doSearch()"
            autofocus
          />
          <button class="btn btn-primary" (click)="doSearch()">Search</button>
        </div>
      }

      <!-- Mobile nav -->
      @if (menuOpen()) {
        <nav class="navbar__mobile-nav">
          @for (cat of navCategories; track cat.slug) {
            <a
              [routerLink]="['/category', cat.slug]"
              class="navbar__mobile-link"
              (click)="menuOpen.set(false)"
            >
              {{ cat.label }}
            </a>
          }
        </nav>
      }
    </header>
  `,
  styles: [
    `
      /* TICKER */
      .ticker {
        background: var(--c-primary);
        color: var(--c-on-primary);
        padding: 0.25rem 0;
        overflow: hidden;
      }
      .ticker__inner {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .ticker__label {
        font-family: var(--font-headline);
        font-size: 0.625rem;
        font-weight: 900;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        background: var(--c-on-primary);
        color: var(--c-primary);
        padding: 0.125rem 0.5rem;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .ticker__viewport {
        overflow: hidden;
        flex: 1;
        min-width: 0;
      }
      .ticker__track {
        display: inline-flex;
        animation: ticker-scroll 30s linear infinite;
      }
      .ticker__track:hover {
        animation-play-state: paused;
      }
      .ticker__text {
        font-family: var(--font-headline);
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        white-space: nowrap;
        padding-right: 3rem;
        flex-shrink: 0;
      }
      @keyframes ticker-scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }

      /* NAVBAR */
      .navbar {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(252, 249, 248, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 0;
        transition: box-shadow 0.3s ease;
      }
      .navbar--scrolled {
        box-shadow: 0 2px 20px rgba(28, 27, 27, 0.08);
      }
      .navbar__inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
      .navbar__left {
        display: flex;
        align-items: center;
        gap: 2rem;
      }
      .navbar__logo {
        font-family: var(--font-headline);
        font-size: 1.5rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        color: var(--c-on-surface);
        text-decoration: none;
      }
      .navbar__nav {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }
      .navbar__link {
        font-family: var(--font-headline);
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--c-on-surface-variant);
        text-decoration: none;
        border-bottom: 2px solid transparent;
        transition:
          color 0.2s,
          border-color 0.2s;
      }
      .navbar__link:hover,
      .navbar__link--active {
        color: var(--c-on-surface);
        border-bottom-color: var(--c-primary);
      }
      .navbar__right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .navbar__icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        background: transparent;
        border: none;
        color: var(--c-on-surface);
        cursor: pointer;
        transition: background 0.2s;
      }
      .navbar__icon-btn:hover {
        background: var(--c-surface-container);
      }
      .navbar__menu-btn {
        display: none;
      }

      /* SEARCH BAR */
      .navbar__search-bar {
        display: flex;
        gap: 0.75rem;
        padding-bottom: 1rem;
      }
      .navbar__search-input {
        flex: 1;
        background: var(--c-surface-container);
        border: none;
        border-bottom: 2px solid var(--c-primary);
        padding: 0.75rem 1rem;
        font-family: var(--font-headline);
        font-size: 0.875rem;
        outline: none;
        border-radius: 0;
      }

      /* MOBILE NAV */
      .navbar__mobile-nav {
        display: flex;
        flex-direction: column;
        background: var(--c-surface-low);
      }
      .navbar__mobile-link {
        font-family: var(--font-headline);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 1rem 2rem;
        border-bottom: 1px solid rgba(228, 190, 186, 0.2);
        color: var(--c-on-surface);
      }

      @media (max-width: 1024px) {
        .navbar__nav {
          display: none;
        }
        .navbar__menu-btn {
          display: flex;
        }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private api = inject(AdminApiService);

  tickers = signal<AdminTicker[]>([]);
  scrolled = signal(false);
  searchOpen = signal(false);
  menuOpen = signal(false);
  searchQuery = '';

  navCategories = [
    { slug: 'world', label: 'World' },
    { slug: 'politics', label: 'Politics' },
    { slug: 'tech', label: 'Tech' },
    { slug: 'business', label: 'Business' },
    { slug: 'culture', label: 'Culture' },
    { slug: 'science', label: 'Science' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }

  ngOnInit() {
    this.api.getAdminTickers().subscribe({
      next: (res) => this.tickers.set(res.data),
      error: () => this.tickers.set([]),
    });
  }
  ngOnDestroy() {}

  loadTickers() {}

  toggleSearch() {
    this.searchOpen.update((v) => !v);
    if (!this.searchOpen()) this.searchQuery = '';
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchOpen.set(false);
      this.searchQuery = '';
    }
  }
}
