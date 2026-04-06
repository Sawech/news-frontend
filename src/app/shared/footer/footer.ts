import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ApiService } from '../../core/services/api.service';
import { LanguageService } from '../../core/services/language.service';
import { Category } from '../../core/models/article.model';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CommonModule, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  private api = inject(ApiService);
  private lang = inject(LanguageService);
  constructor() {
    effect(() => {
      const locale = this.lang.activeLang();
      this.api.getCategories({ locale }).subscribe({
        next: (res) => this.sections.set(res.data),
        error: () => this.sections.set([]),
      });
    });
  }
  sections = signal<Category[]>([]);

  archiveYears = [2026, 2027, 2028, 2029, 2030, 2031];
}
