import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService, AppLang } from '../../core/services/language.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcherComponent {
  lang = inject(LanguageService);

  readonly langs: { code: AppLang; key: string }[] = [
    { code: 'en', key: 'EN' },
    { code: 'fr', key: 'FR' },
    { code: 'ar', key: 'AR' },
  ];

  select(code: AppLang) {
    this.lang.setLanguage(code);
  }
}
