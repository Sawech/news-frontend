import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export type AppLang = 'en' | 'fr' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  readonly activeLang = signal<AppLang>('en');

  /** Call once at app startup — waits for translation file to load. */
  init(): Promise<void> {
    const stored = localStorage.getItem('lang') as AppLang | null;
    const lang: AppLang =
      stored && ['en', 'fr', 'ar'].includes(stored) ? stored : 'en';
    return this._apply(lang);
  }

  setLanguage(lang: AppLang): void {
    this._apply(lang);
    localStorage.setItem('lang', lang);
  }

  private _apply(lang: AppLang): Promise<void> {
    this.activeLang.set(lang);
    const html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    // Wait for the JSON file to actually load before resolving
    return firstValueFrom(this.translate.use(lang)).then(() => undefined);
  }
}
