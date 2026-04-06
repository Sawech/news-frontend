import { Component, OnInit, OnDestroy, signal, inject, HostListener, effect } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher';
import { LanguageService } from '../../core/services/language.service';
import { ApiService } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';
import { Category, Ticker } from '../../core/models/article.model';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    TranslatePipe,
    LanguageSwitcherComponent,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private api = inject(ApiService);
  private lang = inject(LanguageService);
  readonly theme = inject(ThemeService);

  tickers = signal<Ticker[]>([]);
  scrolled = signal(false);
  searchOpen = signal(false);
  menuOpen = signal(false);
  searchQuery = '';
  navCategories = signal<Category[]>([]);

  constructor() {
    effect(() => {
      const locale = this.lang.activeLang();
      console.log('Fetching tickers for locale:', locale);
      this.api.getTickers(locale).subscribe({
        next: (res) => {
          if (res.data.length < 2) this.tickers.set([...res.data, ...res.data]);
          else this.tickers.set(res.data);
        },
        error: () => this.tickers.set([]),
      });
      this.api.getCategories({ locale }).subscribe({
        next: (res) => this.navCategories.set(res.data),
        error: () => this.navCategories.set([]),
      });
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }

  ngOnInit() {}
  ngOnDestroy() {}

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
