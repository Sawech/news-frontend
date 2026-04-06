import { Injectable, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(false);

  init(): void {
    const stored = localStorage.getItem('theme') as AppTheme | null;
    const prefersDark = !stored && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || prefersDark;
    this._apply(dark);
  }

  toggle(): void {
    this._apply(!this.isDark());
  }

  private _apply(dark: boolean): void {
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
}
