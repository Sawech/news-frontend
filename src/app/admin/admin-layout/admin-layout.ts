import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AppLang, LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);

  readonly userName = computed(() => this.auth.currentUser()?.name ?? 'Admin');
  readonly userRole = computed(() => this.auth.currentUser()?.role ?? '');
  readonly userInitial = computed(() => (this.auth.currentUser()?.name ?? 'A')[0].toUpperCase());

  lang = inject(LanguageService);

  readonly langs: { code: AppLang; key: string }[] = [
    { code: 'en', key: 'LANG.EN' },
    { code: 'fr', key: 'LANG.FR' },
    { code: 'ar', key: 'LANG.AR' },
  ];

  select(code: AppLang) {
    this.lang.setLanguage(code);
  }

  logout() {
    this.auth.logout();
  }
}
