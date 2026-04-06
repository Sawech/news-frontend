import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../core/services/api.service';
import { SeoService } from '../core/services/seo.service';
import { Article } from '../core/models/article.model';
import { LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-archive',
  imports: [RouterLink, DatePipe],
  templateUrl: './archive.html',
  styleUrl: './archive.css',
})
export class ArchiveComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly lang = inject(LanguageService);

  year = signal('');
  articles = signal<Article[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);
  totalArticles = signal(0);

  pageNumbers = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const cur = this.currentPage();
    const pages: (number | '...')[] = [1];
    if (cur > 3) pages.push('...');
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
      pages.push(p);
    }
    if (cur < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const year = params.get('year') ?? '';
      this.year.set(year);
      this.currentPage.set(1);
      this.loadArticles(year);
      this.seo.updateMeta({
        title: `Archive ${year} | The Chronicler`,
        description: `Browse all articles published in ${year} on The Chronicler.`,
      });
    });
  }

  loadPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadArticles(this.year());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private loadArticles(year: string) {
    this.loading.set(true);
    this.api
      .getArticles({ year, page: this.currentPage(), limit: 10, locale: this.lang.activeLang() })
      .subscribe((res) => {
        this.articles.set(res.data);
        this.totalArticles.set(res.meta.total);
        this.totalPages.set(res.meta.totalPages);
        this.loading.set(false);
      });
  }
}
